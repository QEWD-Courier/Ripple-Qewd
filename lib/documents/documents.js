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

  01 February 2017

*/

var router = require('qewd-router');
var authenticate = require('../sessions/authenticate');
var openEHR = require('./openEHR');
var healthlink = require('./healthlink');

var routes = [
  {
    url: '/api/document/:documentType',
    method: 'POST',    
    handler: postToOpenEhr
  }
];

routes = router.initialise(routes);

function init() {
    openEHR.init.call(this);
}

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

function postToOpenEhr(args, callback) {
    console.log('** documents.postDocument: ' + JSON.stringify(args));
    var transformer = healthlink[args.documentType];

    if (typeof transformer === "function") {
        var inputDocument = args.req.body;
        var outputDocument = transformer.call(this, inputDocument, callback);
        var patientId = healthlink.getInternalPatientId(inputDocument);
        var templateId = healthlink.getTemplateId(args.documentType);

        openEHR.post(patientId, templateId, outputDocument, 'ethercis', callback);
    }
}

module.exports = {
    init: init,
    api: documents
};