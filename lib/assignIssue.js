module.exports = function (starflow, jiraService) {

  var _ = require('lodash');
  var Promise = require('bluebird');

  function AssignIssue() {
    starflow.BaseExecutable.call(this, 'jira.assignIssue');
    this.nonUserMapping = {
      'unassigned' : '',
      'automatic' : '-1'
    };
  }
  AssignIssue.prototype = Object.create(starflow.BaseExecutable.prototype);
  AssignIssue.prototype.constructor = AssignIssue;

// According to: https://confluence.atlassian.com/display/JIRAKB/How+to+Set+Assignee+to+Unassigned+via+REST+API+in+JIRA
  AssignIssue.prototype.mapNonUserAssignee = function mapNonUserAssignee(assignee) {
    return _.get(this.nonUserMapping, assignee, assignee);
  };

  AssignIssue.prototype.assignIssue = function assignIssue(issue, assignee) {
    var params = _.set({}, 'fields.assignee.name', this.mapNonUserAssignee(assignee));
    var key = issue.key;
    var jiraAssignIssue = Promise.promisify(jiraService.updateIssue, {context: jiraService});

    return jiraAssignIssue(key, params)
      .then(onSuccess.bind(this), onError);


    function onSuccess(response) {
      if (response === 'Success') {
        starflow.logger.success('JIRA issue ' + key + ' was assigned to ' + assignee);
        this.storage.set('assignee', assignee);
      } else {
        starflow.logger.error('There was a problem with the request. Args: ' + [key, assignee].join(', '));
        throw response;
      }
    }

    function onError(err) {
      starflow.logger.error('JIRA issue ' + key + ' could not be assigned to ' + assignee + ' (wrong username?)');
      throw err;
    }
  };

  AssignIssue.prototype.exec = function exec(issue, assignee) {
    if (!_.isObject(issue)) {
      throw new Error('issue parameter must be an object (got ' + issue + ')');
    }
    if (_.isEmpty(assignee)) {
      throw new Error('An assignee is required');
    }

    return this.assignIssue(issue, assignee);
  };

  return function () {
    return new AssignIssue();
  };

};
