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

 20 July 2017

*/

var openEHR = require('../openEHR/openEHR');
var getSummaryDocumentType = require('./getSummaryDocumentType');
var getAQLFile = require('./getAQLFile');

var path = './';

var documentTypes = [
  'iEHR - Healthlink - Discharge Sumary.v0',
  'iEHR - Healthlink - Referral.v0'
];

function getSummary(args, callback) {
  var patientId = args.patientId;
  var documents = [];

  if (typeof patientId !== 'undefined' && patientId !== '') {
    openEHR.startSessions(args.session, function (openEHRSessions) {
      openEHR.mapNHSNo(patientId, openEHRSessions, function () {

        var aqlTemplate = getAQLFile();
        var count = 0;
        var documentCount;
        var documentType;
        // loop around for doc type
        documentTypes.forEach(function(templateId) {
          getSummaryDocumentType(patientId, templateId, aqlTemplate, openEHRSessions, function(results) {
            results.forEach(function(result) {
              documents.push(result);
            });
            count++;
            if (count === documentTypes.length) {
              openEHR.stopSessions(openEHRSessions, args.session);
              callback(documents);
            }
          });
        });
      });
    });
  }
  else {
    callback({error: 'Missing or invalid patient Id'});
  }
}

module.exports = getSummary;
