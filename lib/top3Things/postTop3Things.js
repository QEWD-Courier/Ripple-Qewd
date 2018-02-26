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

  22 January 2018

*/

/*

Top 3 Things

  POST /api/patients/9999999000/top3Things

Incoming POST payload

{
  name1: 'Item 1',
  description1: 'My first problem',
  name2: 'Item 2',
  description2: 'My second problem',
  name3: 'Item 3',
  description3: 'My third problem'
}


Stored as:

  Top3Things('bySourceId', sourceId) = {
    patientId: 9999999000,
    date: 12345678, //getTime() format
    data: {
      name1: 'Item 1',
      description1: 'My first problem',
      name2: 'Item 2',
      description2: 'My second problem',
      name3: 'Item 3',
      description3: 'My third problem'
    }
  }

  Top3Things('byPatientId', patientId, 'byDate', date) = sourceId

  Top3Things('byPatientId', patientId, 'latest') = sourceId

*/

var uuid = require('uuid/v4');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function postTop3Things(args, finished) {

  var payload = args.req.body;
  var patientId = args.patientId;

  if (!patientId || patientId === '' || !isNumeric(patientId)) {
    return finished({error: 'Missing or invalid Patient Id'});
  }

  console.log('postTop3Things - payload = ' + JSON.stringify(payload));

  if (!payload.name1 || payload.name1 === '') {
    return finished({error: 'You must specify at least 1 Top Thing'});
  }

  if (!payload.description1 || payload.description1 === '') {
    return finished({error: 'You must specify at least 1 Top Thing'});
  }

  if (!payload.name2 || payload.name2 === '') {
    if (payload.description2 && payload.description2 !== '') {
      return finished({error: 'A Description for the 2nd Top Thing was defined, but its summary name was not defined'});
    }
    payload.name2 = '';
    payload.description2 = '';
  }
  else {
    payload.description2 = payload.description2 || '';
  }

  if (!payload.name3 || payload.name3 === '') {
    if (payload.description3 && payload.description3 !== '') {
      return finished({error: 'A Description for the 3rd Top Thing was defined, but its summary name was not defined'});
    }
    payload.name3 = '';
    payload.description3 = '';
  }
  else {
    payload.description3 = payload.description3 || '';
  }

  var doc = this.db.use('Top3Things');
  // create a sourceId uuid
  var sourceId = uuid();
  var dateCreated = new Date().getTime()

  doc.$(['bySourceId', sourceId]).setDocument({
    patientId: patientId,
    date: dateCreated,
    data: payload
  });

  byPatient = doc.$(['byPatient', patientId]);
  byPatient.$(['byDate', dateCreated]).value = sourceId;
  byPatient.$('latest').value = sourceId;

  finished({sourceId: sourceId});
}

module.exports = postTop3Things;
