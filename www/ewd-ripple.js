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

  17 October 2016

*/

var ewdXpress = require('ewd-xpress').master;

var config = {
  managementPassword: 'keepThisSecret!',
  serverName: 'RippleOSI EWD3 Server',
  port: 3000,
  poolSize: 4,
  webServerRootPath: '/opt/tomcat/ripple',
  database: {
    type: 'gtm'
  },
  lockSession: false,
  /*
  resilientMode: {
    keepPeriod: 600 // just keep the last 10 minutes
  }
  */
};

var routes = [
  {
    path: '/api',
    module: 'ewd-ripple'
  }
];

var q = ewdXpress.start(config, routes);

var app = ewdXpress.intercept().app;

var pasConfig = {
  openEHR: {
    pasModule: 'mysqlPAS',
    summaryHeadings: ['allergies', 'problems', 'medications', 'contacts', {name: 'transfers', value: true}]
  }
};

var pas = process.argv[2] || 'openEHR' 
q.userDefined['rippleUser'] = pasConfig[pas];

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}

app.use(errorHandler);



