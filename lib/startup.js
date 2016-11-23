/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
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

  17 November 2016

*/

var ewdXpress = require('ewd-xpress').master;
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

function start(config) {

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

  var routes = [
    {
      path: '/api',
      module: 'ewd-ripple'
    }
  ];

  var q = ewdXpress.start(config, routes);

  var failURL = config.auth0.failURL || '/fail.html';
  var callbackPath = config.auth0.callbackPath || '/auth0/token';

  var app = ewdXpress.intercept().app;
  app.use(passport.initialize());
  app.use(passport.session());
  app.get(callbackPath,
    passport.authenticate('auth0', { failureRedirect: failURL }),
    function(req, res) {
      var message = {
        type: 'ewd-qoper8-express',
        expressType: 'auth0-register',
        application: 'ewd-ripple',
        params: req.user
      };
      q.handleMessage(message, function(response) {
        console.log('*** auth0-register response: ' + JSON.stringify(response));
        res.cookie('JSESSIONID', response.message.token);
        res.redirect(config.auth0.indexURL);
      });
    }
  );

  var pasConfig = config.ripple.pas;

  var pas = process.argv[2] || 'openEHR' 
  q.userDefined['rippleUser'] = pasConfig[pas];
  q.userDefined['rippleMode'] = config.ripple.mode;
  q.userDefined['auth0'] = config.auth0;
}

module.exports = {
  start: start
};



