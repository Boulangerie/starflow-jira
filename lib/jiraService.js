module.exports = function (starflow, config) {

  // API: http://github.com/steves/node-jira
  var JiraApi = require('jira').JiraApi;
  var url = require('url');
  var _ = require('lodash');

  if (!config.URL) {
    throw new Error('Jira URL is mandatory');
  }

  var user = config.USERNAME;
  var pass = config.PASSWORD;

  var urlParts = url.parse(baseUrl);
  var protocol = _.trimRight(urlParts.protocol, ':');

  if (_.isEmpty(user) && urlParts.auth) {
    user = _.get(urlParts.auth.split(':'), 0);
    pass = _.get(urlParts.auth.split(':'), 1);
  }

  return new JiraApi(protocol, urlParts.host, urlParts.port, user, pass, 2);

};
