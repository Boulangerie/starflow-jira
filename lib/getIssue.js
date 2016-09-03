module.exports = function (starflow, jiraService) {

  var _ = require('lodash');
  var Promise = require('bluebird');
  var Task = starflow.Task;
  var spawnFactory = require('starflow-shell')(starflow).factories.spawn;

  function GetIssue() {
    starflow.BaseExecutable.call(this, 'jira.getIssue');
  }
  GetIssue.prototype = Object.create(starflow.BaseExecutable.prototype);
  GetIssue.prototype.constructor = GetIssue;

  GetIssue.prototype.getIssue = function getIssue(key) {
    function onSuccess(issue) {
      starflow.logger.success('JIRA issue "' + key + '" was found');
      var type = _.get(issue, 'fields.issuetype.name', 'Unknown type');
      var assignee = !_.isNull(_.get(issue, 'fields.assignee')) ? _.get(issue, 'fields.assignee.name') : 'Nobody';
      starflow.logger.log('<' + type + '> ' + _.get(issue, 'fields.summary') + ' (assigned to ' + assignee + ', status: ' + _.get(issue, 'fields.status.name') + ')');
      this.storage.set('issue', issue);
    }

    function onError(err) {
      starflow.logger.error('JIRA issue "' + key + '" was not found');
      throw err;
    }
    var jiraFindIssue = Promise.promisify(jiraService.findIssue, {context: jiraService});
    return jiraFindIssue(key)
      .then(onSuccess.bind(this), onError);
  };

  GetIssue.prototype.openJiraLink = function openJiraLink(key) {
    var executableChild = this.createExecutable(spawnFactory);
    var url = jiraService.protocol + '://' + jiraService.host + '/browse/' + key;
    return new Task(executableChild, ['open', url]).run();
  };

  GetIssue.prototype.exec = function exec(key, withOpen) {
    if (_.isEmpty(key)) {
      throw new Error('JIRA issue key is required');
    }

    var promise = this.getIssue(key);
    if (withOpen) {
      promise = promise.then(this.openJiraLink.bind(this, key));
    }
    return promise;
  };

  return function () {
    return new GetIssue();
  };

};
