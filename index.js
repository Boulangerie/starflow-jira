module.exports = function (starflow) {

  var config = {
    URL: starflow.config.get('jira.URL'),
    USERNAME: starflow.config.get('jira.USERNAME'),
    PASSWORD: starflow.config.get('jira.PASSWORD')
  };

  var jiraService = require('./lib/jiraService')(starflow, config);

  return {
    service: jiraService,
    factories: {
      getIssue: require('./lib/getIssue')(starflow, jiraService),
      assignIssue: require('./lib/assignIssue')(starflow, jiraService),
      changeIssueStatus: require('./lib/changeIssueStatus')(starflow, jiraService),
      getIssueStatuses: require('./lib/getIssueStatuses')(starflow, jiraService)
    }
  };

};
