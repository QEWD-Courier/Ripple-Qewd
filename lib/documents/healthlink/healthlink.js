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

 10 March 2017

*/

const path = './';

var types = {
  referrals: require(path + 'referrals'),
  discharges: require(path + 'discharge')
};

function getInternalPatientId(document) {

  const patientIdentifiers = document['REF_I12']['PID']['PID.3'];

  var patientIdentiferComposite;
  if (Array.isArray(patientIdentifiers)) {
    patientIdentiferComposite = patientIdentifiers[0]['CX.1'];
  }
  else {
    patientIdentiferComposite = patientIdentifiers['CX.1'];
  }

  var patientIdentifier;
  if (Array.isArray(patientIdentiferComposite)) {
    patientIdentifier = patientIdentiferComposite[0];
  }
  else {
    patientIdentifier = patientIdentiferComposite;
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

  const properties = Object.keys(types);
  for (var p = 0; (p < properties.length && document === undefined); p++) {
    const currentDocument = types[properties[p]];

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