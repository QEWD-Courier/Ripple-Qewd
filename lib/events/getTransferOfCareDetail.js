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

function getTransferOfCareDetail(args, callback) {

  var patientId = args.patientId;

  if (typeof patientId === 'undefined' || patientId === '') {
    return callback({error: 'patientId not defined or invalid'});
  }

  var sourceId = args.sourceId;

  if (typeof sourceId === 'undefined' || sourceId === '') {
    return callback({error: 'sourceId not defined or invalid'});
  }

  var docName = this.userDefined.tocDocumentName;
  var tocDoc = new this.documentStore.DocumentNode(docName, ['byPatient', patientId, sourceId]);
  if (!tocDoc.exists) return callback({error: 'No record exists for ' + patientId + ' with sourceId: ' + sourceId});

  var results = tocDoc.getDocument(true);
  if (typeof results.source === 'undefined') results.source = 'qewdDB';
  callback(results);
}

module.exports = getTransferOfCareDetail;
