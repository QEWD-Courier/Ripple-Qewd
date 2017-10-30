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

  19 October 2017

*/

var router = require('qewd-router');
var openEhr = require('./openEhr/openEhr');
var healthlink = require('./healthlink/healthlink');
var canonical = require('./canonical/canonical');
var authenticate = require('../sessions/authenticate');

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


function getDocumentType(rawDocument) {
  if (typeof rawDocument['REF_I12'] === 'undefined') {
    return false;
  }
  if (typeof rawDocument['REF_I12']['RF1'] !== 'undefined') {
    return 'referral';
  }
  if (typeof rawDocument['REF_I12']['DG1'] !== 'undefined') {
    return 'discharge';
  }
  return false;
}

var templates = {
  referral: 'iEHR - Healthlink - Referral.v0',
  discharge: 'iEHR - Healthlink - Discharge Sumary.v0'
};

routes = router.initialise(routes);

var q;

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

function postOneToOpenEhr(args, callback) {
  var host = args.host;
  if (host === undefined) {
    host = 'marand';
  }

  var rawDocument = args.req.body;

  var openEhrDocument = healthlink.toOpenEhr(rawDocument);
  var nhsNum = healthlink.getInternalPatientId(rawDocument);
  var documentType = getDocumentType(rawDocument);
  var template = templates[documentType];

  var patientId = args.patientId;
  if (!patientId) patientId = nhsNum;

  /*
  callback({
    just: 'testing',
    nhsNum: nhsNum,
    patientId: patientId,
    template: template,
    host: host,
    document: openEhrDocument
  });
  return;

  */

  openEhr.postOne(patientId, openEhrDocument, host, template, callback);
}

function getAllFromOpenEhr(args, callback) {
  var summaryDocuments;
  var summaryDocument;

  const nhsNum = args.patientId;
  
  summaryDocuments = readCache(args.session.data, nhsNum, 'summary');
  if (typeof summaryDocuments !== 'undefined') {
    callback(summaryDocuments);
  }
  else {
    summaryDocuments = [];
    openEhr.getAllByNhsNumber(nhsNum, function(openEhrDocuments) {
      for (var openEhrDocument in openEhrDocuments) { 
        summaryDocument = canonical.toSummary(openEhrDocuments[openEhrDocument].source, openEhrDocuments[openEhrDocument].composition);
        
        summaryDocuments.push(summaryDocument);

        if(summaryDocuments.length == openEhrDocuments.length) {
          writeCache(summaryDocuments, args.session.data, nhsNum, 'summary');
          callback(summaryDocuments);
        }
      }
    });
  }
}

function getOneFromOpenEhr(args, callback) {
  var detailDocument;
  var currentDetailDocument
  
  const nhsNum = args.patientId;
  const documentId = args.documentId;

  //detailDocument = readCache(args.session.data, nhsNum, documentId);

  var sourceId = args.documentId.split('::')[0];
  var cachedDetail = args.session.data.$(['patients', nhsNum, 'documents', 'detail', sourceId]);

  if (!cachedDetail.exists) {
    // big hit if we've not seen this doc before but hopefully quicker next time
    openEhr.getAllByNhsNumber(nhsNum, function(openEhrDocuments) {
      for (var d = 0; d < openEhrDocuments.length; d++) {
        currentDetailDocument = canonical.toDetail(openEhrDocuments[d].source, openEhrDocuments[d].composition);
        //writeCache(currentDetailDocument, args.session.data, nhsNum, currentDetailDocument.sourceId);

        var sourceId = currentDetailDocument.sourceId.split('::')[0];
        args.session.data.$(['patients', nhsNum, 'documents', 'detail', sourceId]).setDocument(currentDetailDocument);

        if (currentDetailDocument.sourceId === documentId) {
          detailDocument = currentDetailDocument;
        }

        // make sure that we process all documents before we return
        if (d == (openEhrDocuments.length - 1)) {
          if (detailDocument !== undefined) {
            callback(detailDocument);
          }
          else {
            callback({error: 'could not find document with the id ' + documentId});
          }
        }
      }
    });    
  }
  else {
     callback(cachedDetail.getDocument(true));
  }
}

function readCache(cache, nhsNum, cacheKey) {
  var cachedValue;

  var cachedEntry = cache.$(['patients', nhsNum, 'documents', cacheKey]);
  if (cachedEntry.exists) {
    cachedValue = cachedEntry.getDocument(true);
  }

  return cachedValue;
}

function writeCache(valueToCache, cache, nhsNum, cacheKey) {
  cache.$(['patients', nhsNum, 'documents', cacheKey]).setDocument(valueToCache);
}

module.exports = {
  init: function() {
    q = this;
    openEhr.init.call(this);
  },
  api: documents,
  postDocument: postOneToOpenEhr
};
