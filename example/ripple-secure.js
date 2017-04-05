/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-17 Ripple Foundation Community Interest Company       |
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

  26 January 2017

*/

var ewdRipple = require('qewd-ripple/lib/startup');

var config = {
  auth0: {
    domain:       'rippleosi.eu.auth0.com',
    clientID:     'Ghi91Wk1PERQjxIN5ili6rssnl4em8In',
    callbackURL:  'https://138.68.134.7:8081/auth0/token',
    clientSecret: 'sZn_wWPQQV3mfIYDANrufQ12pyWcCtWULoGOqqakH1IiCs0IBLRybK6c1XB863WT',
    indexURL: '/index.html',
    connections: ['Username-Password-Authentication', 'google-oauth2', 'twitter']
  },
  port: 8081,
  poolSize: 2,
  ripple: {
    mode: 'secure'
  },
  cors: true,
  ssl: {
    keyFilePath: 'ssl/ssl.key',
    certFilePath: 'ssl/ssl.crt',
  }
};

config.addMiddleware = function(bodyParser, app) {
  require('body-parser-xml')(bodyParser);
  app.use(bodyParser.xml({
     limit: '1MB',
     xmlParseOptions: {
        explicitArray: false
     }
  }));
};

ewdRipple.start(config);
