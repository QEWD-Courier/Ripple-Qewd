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
var openEhr = require('./openEhr/openEhr');
var healthlink = require('./healthlink/healthlink');
var canonical = require('./canonical/canonical');

var routes = [
  {
    url: '/api/documents/:documentType',
    method: 'POST',    
    handler: postOneToOpenEhr
  },
  {
    url: '/api/documents/patient/:patientId',
    method: 'GET',    
    handler: getAllFromOpenEhr
  }, 
  {
    url: '/api/documents/patient/:patientId/:documentId',
    method: 'GET',    
    handler: getOneFromOpenEhr
  }     
];

routes = router.initialise(routes);

var q;

function documents(messageObj, finished) {
    var status = {};

    router.process.call(this, messageObj, status.session, routes, function(results) {
        finished(results);
    });   
}

function postOneToOpenEhr(args, callback) {
    var host = args.host;
    if(host === undefined) {
      host = 'marand';
    }

    var openEhrDocument = healthlink.toOpenEhr(args.req.body);
    var nhsNum = healthlink.getInternalPatientId(args.req.body);

    openEhr.postOne(nhsNum, openEhrDocument, host, callback);
}

function getAllFromOpenEhr(args, callback) {
  var allDocuments = []
  
  const nhsNum = args.patientId;

  openEhr.getAllByNhsNumber(nhsNum, function(openEhrDocuments) {
    for(var openEhrDocument in openEhrDocuments) { 
          const canonicalDocument = canonical.toSummary(openEhrDocuments[openEhrDocument].source, openEhrDocuments[openEhrDocument].composition);
          
          allDocuments.push(canonicalDocument);

          if(allDocuments.length == openEhrDocuments.length) {
              callback(allDocuments);
          }
      }
  });
}

function getOneFromOpenEhr(args, callback) {
  const nhsNum = args.patientId;
  const documentId = args.documentId;

  openEhr.getOneByCompositionId(nhsNum, documentId, function(openEhrDocument) {
      const canonicalDocument = canonical.toDetail(openEhrDocument.source, openEhrDocument.composition);
      callback(canonicalDocument);
  });
}

module.exports = {
    init: function() {
      q = this;
      openEhr.init.call(this);
    },
    api: documents,
};