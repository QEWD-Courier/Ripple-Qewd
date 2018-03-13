/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  26 February 2018

*/

var qewd = require('qewd').master;

var openehr_jumper;

try {
  openehr_jumper = require('ripple-openehr-jumper');
}
catch(err) {
};

function start(config) {

  var cookiePath = '/';

  var routes = [
    {
      path: '/api',
      module: 'qewd-ripple'
    }
  ];

  if (openehr_jumper) {
    routes.push({
      path: '/jumper',
      module: 'ripple-openehr-jumper'
    });
  }

  if (!config.webServerRootPath) config.webServerRootPath = process.cwd() + '/www';
  if (!config.database) config.database = {type: 'gtm'};
  if (!config.serverName) config.serverName = 'RippleOSI QEWD Server';
  if (!config.managementPassword) config.managementPassword = 'keepThisSecret!';

  var q = qewd.start(config, routes);

  if (config.auth0) {
    var passport = require('passport');
    var Auth0Strategy = require('passport-auth0');

    var strategy = new Auth0Strategy({
        domain: config.auth0.domain,
        clientID: config.auth0.clientID,
        clientSecret: config.auth0.clientSecret,
        callbackURL: config.auth0.callbackURL,
      },
      function(accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
      }
    );

    passport.use(strategy);
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    var failURL = config.auth0.failURL || '/fail.html';
    var callbackPath = config.auth0.callbackPath || '/auth0/token';

    var app = qewd.intercept().app;
    app.use(passport.initialize());
    app.use(passport.session());
    app.get(callbackPath,
      passport.authenticate('auth0', { failureRedirect: failURL }),
      function(req, res) {
        var message = {
          type: 'ewd-qoper8-express',
          expressType: 'auth0-register',
          application: 'qewd-ripple',
          params: req.user
        };
        q.handleMessage(message, function(response) {
          console.log('*** auth0-register response: ' + JSON.stringify(response));
          res.cookie('JSESSIONID', response.message.token, {path: cookiePath});
          res.redirect(config.auth0.indexURL);
        });
      }
    );
    q.userDefined['auth0'] = config.auth0;
  }

  var pasConfig = {
    openEHR: {
      pasModule: 'mysqlPAS',
      summaryHeadings: ['allergies', 'problems', 'medications', 'contacts', {name: 'transfers', value: true}]
    }
  };
  if (config.ripple && config.ripple.pas) pasConfig = config.ripple.pas;

  var pas = process.argv[2] || 'openEHR' 
  q.userDefined['rippleUser'] = pasConfig[pas];
  var mode = 'demo';
  if (config.ripple && config.ripple.mode) mode = config.ripple.mode;
  q.userDefined['rippleMode'] = mode;

  q.userDefined['sessionTimeout'] = config.sessionTimeout || 900; // 15 minutes session timeout
  q.userDefined.clinicalStatementsDocumentName = 'rippleClinStatements';
  q.userDefined.tocDocumentName = 'rippleTOC';

}

module.exports = {
  start: start
};



