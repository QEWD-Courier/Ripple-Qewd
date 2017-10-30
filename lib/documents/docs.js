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
 | Author: Will Weatherill                                                  |
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

  20 October 2017

*/

var router = require('qewd-router');
var authenticate = require('../sessions/authenticate');
var getDocumentSummary = require('./getDocumentSummary');
var getDocumentDetail = require('./getDocumentDetail');
var postDocument = require('./postDocument');

var postDocumentOld = require('./documents').postDocument;

var routes = [
  {
    url: '/api/documents/patient/:patientId/:host',
    method: 'POST',    
    handler: postDocumentOld
  },
  {
    url: '/api/documents/patient/:patientId/:sourceId',
    method: 'GET',    
    handler: getDocumentDetail
  },
  {
    url: '/api/documents/patient/:patientId',
    method: 'GET',    
    handler: getDocumentSummary
  },
  {
    url: '/api/documents/new',
    method: 'POST',    
    handler: postDocument
  }
];

routes = router.initialise(routes);

function documents(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  if (status.error) {
    finished(status);
    return;
  }

  router.process.call(this, messageObj, status.session, routes, function(results) {
    finished(results);
  });   
}

module.exports = {
  api: documents
};
