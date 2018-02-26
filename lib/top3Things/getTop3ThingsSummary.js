/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  6 February 2018

*/

/*

Top 3 Things summary

  GET /api/patients/9999999000/top3Things

Returns empty array or latest in format

*/

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getTop3ThingsSummary(args, finished) {

  var patientId = args.patientId;
  console.log('*** getTop3ThingsSummary: patientId = ' + patientId);
  if (!patientId || patientId === '' || !isNumeric(patientId)) {
    return finished({error: 'Missing or invalid Patient Id'});
  }

  var doc = this.db.use('Top3Things');

  var sourceId = doc.$(['byPatient', patientId, 'latest']).value;
  if (sourceId === '') {
    return finished([]);
  }

  var top3 = doc.$(['bySourceId', sourceId]).getDocument();
  var summary = [{
    source: 'QEWDDB',
    sourceId: sourceId,
    dateCreated: top3.date,
    name1: top3.data.name1,
    name2: top3.data.name2,
    name3: top3.data.name3
  }];

  finished(summary);
}

module.exports = getTop3ThingsSummary;
