# starflow-jira [![Build Status](https://travis-ci.org/Boulangerie/starflow-jira.svg?branch=master)](https://travis-ci.org/Boulangerie/starflow-jira)

## Prerequisites

In order to use this plugin, your project must have [starflow](http://github.com/boulangerie/starflow) as a dependency.

## Install

```
$ npm install --save-dev starflow-jira
```

## Usage

Using a workflow:

```js
var starflow = require('starflow');

var steps = [
  {'jira.getIssue': 'FOO-123'}
];

var workflow = new starflow.Workflow(steps);
return workflow
  .addPlugin(require('starflow-jira'))
  .run();
```

In an executable:

```js
module.exports = function (starflow) {
  var getIssueFactory = require('starflow-jira')(starflow).factories.getIssue;

  function MyExecutable() {
    starflow.BaseExecutable.call(this, 'myPlugin.myExecutable');
  }
  MyExecutable.prototype = Object.create(starflow.BaseExecutable.prototype);
  MyExecutable.prototype.constructor = MyExecutable;

  MyExecutable.prototype.exec = function exec() {
    var getIssueExecutable = this.createExecutable(getIssueFactory);
    return new starflow.Task(getIssueExecutable, 'FOO-123')
      .run()
      .then(function () {
        var issueResponse = this.storage.get('jira.getIssue/issue');
        starflow.logger.log('Got the following Jira issue: ' + issueResponse);
      }.bind(this));
  };

  return function () {
    return new MyExecutable();
  };
};
```

## Executables

Thereafter is the list of all the executable classes provided by this plugin.

> **Important** The titles indicate the name that can be used when writing the steps of a workflow.

### jira.getIssue

Given an issue key (e.g. `FOO-123`), gets data about this issue.
Please go to the [Get issue > Responses](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-getIssue) section of the official Jira API documentation for more details.

The step accepts a second (optional) parameter:

- **withOpen** (default value: `false`): open a new tab in the browser for the given issue (e.g. http://jira.example.com/browse/FOO-123)

Usage:
```js
// for a workflow
var withOpenUrl = false;
var steps = [
  {'jira.getIssue': ['FOR-123', withOpenUrl]}
];

// in an executable
var getIssueFactory = require('starflow-jira')(starflow).factories.getIssue;
var getIssueExecutable = this.createExecutable(getIssueFactory);

var withOpenUrl = false;
var myTask = new starflow.Task(getIssueExecutable, ['FOR-123', withOpenUrl]);
```

### jira.assignIssue

Given an issue key and a username, assigns the issue to that user.

Usage:
```js
// for a workflow
var steps = [
  {'jira.assignIssue': ['FOO-123', 'bob.modnar']}
];

// in an executable
var assignIssueFactory = require('starflow-jira')(starflow).factories.assignIssue;
var assignIssueExecutable = this.createExecutable(assignIssueFactory);

var myTask = new starflow.Task(assignIssueExecutable, ['FOO-123', 'bob.modnar']);
```

### jira.getIssueStatuses

Given an issue key, get the available statuses ("transitions" in Jira context) for this issue.
Please go to the [Get transitions > Responses](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-getTransitions) section of the official Jira API documentation for more details.

Usage:
```js
// for a workflow
var steps = [
  {'jira.getIssueStatuses': 'FOO-123'}
];

// in an executable
var getIssueStatusesFactory = require('starflow-jira')(starflow).factories.getIssueStatuses;
var getIssueStatusesExecutable = this.createExecutable(getIssueStatusesFactory);

var myTask = new starflow.Task(getIssueStatusesExecutable, 'FOO-123');
```

### jira.changeIssueStatus

Given an issue key and a status name, change the issue status to the one provided (if the issue workflow allows it).

Usage:
```js
// for a workflow
var steps = [
  {'jira.changeIssueStatus': ['FOO-123', 'in progress']}
];

// in an executable
var changeIssueStatusFactory = require('starflow-jira')(starflow).factories.changeIssueStatus;
var changeIssueStatusExecutable = this.createExecutable(changeIssueStatusFactory);

var myTask = new starflow.Task(changeIssueStatusExecutable, ['FOO-123', 'in progress']);
```

## Config

Some behaviors of this plugin depend on the values of config variables, here's the list of them and their effect.

- **URL** (no default value, **mandatory**) URL of the Jira service (e.g. http://jira.example.com).
- **USERNAME** (no default value, **mandatory**) Jira username.
- **PASSWORD** (no default value, **mandatory**) Jira password.

You can set these config variables from several ways:

- Env variables on your machine.
  
  Example (assuming `index.js` contains your workflow that uses the _jira_ executables):
  
  ```
  $ starflow_jira__URL=http://jira.example.com starflow_jira__USERNAME=bob.modnar starflow_jira__PASSWORD=password node index.js 
  ```

- `.starflowrc` file at the root of your project (but you probably shouldn't choose this option as the credentials shouldn't be so easily accessible).

  Example:

  ```json
  {
    "jira": {
      "URL": "http://jira.example.com",
      "USERNAME": "bob.modnar",
      "PASSWORD": "password"
    }
  }
  ```

> :bulb: **Recommendation** Store your Jira credentials as `starflow_jira__USERNAME` and `starflow_jira__PASSWORD` variables in your `~/.bash_profile` or `~/.zshrc` file.

Internally, Starflow uses the [rc module](https://jira.com/dominictarr/rc) to handle the config values.

## Storage

Some of the executables of this plugin store some values in their storage.

### jira.getIssue

- **issue** Contains the issue data (id, summary, assignee...) from the Jira server.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jira.getIssue': 'FOO-123'},
    {'custom.echo': '{{/jira.getIssue/issue.summary}}'} // e.g. displays "This is the issue title/summary"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jira'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### jira.assignIssue

- **assignee** The name of the assignee provided in the parameters.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jira.assignIssue': ['FOO-123', 'bob.modnar'},
    {'custom.echo': '{{/jira.assignIssue/assignee}}'} // displays "bob.modnar"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jira'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### jira.getIssueStatuses

- **statuses** Contains the list of statuses ("transitions" in Jira terms) available for a given issue.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jira.getIssueStatuses': 'FOO-123'},
    {'custom.echo': '{{/jira.getIssueStatuses/statuses.transitions[0].name}}'} // e.g. displays "In progress"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jira'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### jira.changeIssueStatus

- **status** The status name provided in the parameters.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jira.changeIssueStatus': ['FOO-123', 'To deploy']},
    {'custom.echo': '{{/jira.changeIssueStatus/status}}'} // displays "To deploy"
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jira'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

> **Note:** learn more about storage paths on the [Starflow documentation page](http://jira.com/boulangerie/starflow/blob/master/docs/API.md#path-format).

If you want to contribute, please take the time to update this README file with the new executables/API brought by your contribution. Thank you! :heart:
