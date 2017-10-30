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

 16 October 2017

*/

const path = './';

var types = {
  referrals: require(path + 'referrals'),
  discharges: require(path + 'discharge')
};

function getInternalPatientId(document) {

  const patientIdentifiers = document['REF_I12']['PID']['PID.3'];

  console.log('**** patientIdentifiers: ' + JSON.stringify(patientIdentifiers));

  var patientIdentiferComposite;
  if (Array.isArray(patientIdentifiers)) {
    patientIdentifierComposite = patientIdentifiers[0]['CX.1'];
    console.log('**** patientIdentifierComposite 1: ' + patientIdentifierComposite);
  }
  else {
    patientIdentifierComposite = patientIdentifiers['CX.1'];
    console.log('**** patientIdentifierComposite 2: ' + patientIdentifierComposite);
  }

  var patientIdentifier;
  if (Array.isArray(patientIdentifierComposite)) {
    patientIdentifier = patientIdentifierComposite[0];
    console.log('**** patientIdentifier 1: ' + patientIdentifier);
  }
  else {
    patientIdentifier = patientIdentifierComposite;
    console.log('**** patientIdentifier 2: ' + patientIdentifier);
  }

  return patientIdentifier;
}

function toOpenEhr(heatlhlinkDocument) {
  const handler = getDocumentHandler(heatlhlinkDocument);
  const openEhrDocument = handler.toOpenEhr(heatlhlinkDocument);
  return openEhrDocument;
}

function getDocumentHandler(healthlinkDocument) {
  var document;
  var currentDocument;

  const properties = Object.keys(types);
  for (var p = 0; (p < properties.length && document === undefined); p++) {
    currentDocument = types[properties[p]];

    if (currentDocument.canHandle(healthlinkDocument)) {
      document = currentDocument;
    }
  }

  return document;
}

module.exports = {
  toOpenEhr: toOpenEhr,
  getInternalPatientId: getInternalPatientId
};
