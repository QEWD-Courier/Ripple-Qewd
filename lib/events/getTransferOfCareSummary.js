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

  17 May 2017

*/

function getTransferOfCareSummary(args, callback) {

  var patientId = args.patientId;

  if (typeof patientId === 'undefined' || patientId === '') {
    return callback({error: 'patientId not defined or invalid'});
  }

  var docName = this.userDefined.tocDocumentName;
  var tocsDoc = new this.documentStore.DocumentNode(docName, ['byPatient', patientId]);

  var results = [];

  tocsDoc.forEachChild(function(sourceId, tocDoc) {
    results.push({
      sourceId: sourceId,
      from: tocDoc.$('from').value,
      to: tocDoc.$('to').value,
      transferDateTime: tocDoc.$('transferDateTime').value,
      source: tocDoc.$('source').value || 'qewdDB'
    });
  });

  callback(results);
}

module.exports = getTransferOfCareSummary;
