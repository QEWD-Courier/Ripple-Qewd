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

  9 March 2017

*/

/*

Clinical Statement Storage

Incoming POST payload

{
    "type": "Clinical Note",
    "text": "Patient presented with shoulder pain.\r\nIf it doesn\'t improve, will need laparoscopic surgical exploration +/- repair",
    "author": "Dr John Smith",

    "contentStore": {
      // this allows return from the UI of the content store information

      "name": "ts",  // need to know which content store was used
      "phrases": [
        // these are the content store phrase Ids used to create the text

        // the middle tier will obtain the full triplet data from the content store

        {id: 123, tag: 'ortho'},
        {id: 124, value: 10, tag: 'chestpain'} // this phrase had a variable value
      ]
    }
}


Stored as:

  clinicalStatements('byPatient', patientId, sourceId) = 

{
    "sourceId: 'xxxxxxxxx',
    "type": "Clinical Note",
    "text": "Patient presented with shoulder pain.\r\nIf it doesn\'t improve, will need laparoscopic surgical exploration +/- repair",
    "author": "Dr John Smith",
    "tags": {
      "ortho": true,
      "chestpain": true
    },
    dateCreated: 123456677,
    source: 'ethercis',

    "phrases": [
      { text: 'uiText',
        tag: 'ortho',
        subject: 'xxxxx',
        value: 'yyyy',
        unit: 'zzzz' 
      },
    ]
}

*/


var uuid = require('uuid/v4');
var contentStore = require('qewd-content-store');
var createIndices = require('./createIndices');

function postStatement(patientId, session, payload, finished) {
  console.log('postStatement - payload = ' + JSON.stringify(payload));

  if (!payload.type || payload.type === '') {
    return finished({error: 'Missing or empty Clinical Statement Type'});
  }

  if (!payload.text || payload.text === '') {
    return finished({error: 'Missing or empty text'});
  }

  if (!payload.author || payload.author === '') {
    return finished({error: 'Missing or empty author'});
  }

  if (!payload.contentStore) {
    return finished({error: 'Missing Content Store Details'});
  }

  if (!payload.contentStore.name || payload.contentStore.name === '') {
    return finished({error: 'Missing or empty Content Store Name'});
  }

  var content = contentStore.get.call(this, payload.contentStore.name);

  var phrases = [];
  var tags = {};
  if (payload.contentStore.phrases) {
    payload.contentStore.phrases.forEach(function(phraseObj) {
      if (phraseObj.id) {
        var phrase = content.get(phraseObj.id, '_all');
        var result = {
          text: phrase.uiPhrase,
          tag: phraseObj.tag,
        };
        tags[phraseObj.tag] = true;
        result.subject = phraseObj.subject || phrase.subject.value;
        var value;
        if (phraseObj.value) value = phraseObj.value;
        if (!value && phrase.value && phrase.value.value) value = phrase.value.value;
        if (value) result.value = value;
        var unit;
        if (phraseObj.unit) unit = phraseObj.unit;
        if (!unit && phrase.unit && phrase.unit.value) unit = phrase.unit.value;
        if (unit) result.unit = unit;
        phrases.push(result);
      }
    });
  }
  

  // OK the clinical statement can now be saved

  // create a sourceId uuid

  var sourceId = uuid();

  var clinicalStatement = {
    type: payload.type,
    text: payload.text,
    author: payload.author,
    sourceId: sourceId,
    source: 'ethercis',
    dateCreated: new Date().getTime(),
    tags: tags,
    phrases: phrases
  };

  var docName = this.userDefined.clinicalStatementsDocumentName;
  var clinicalDoc = new this.documentStore.DocumentNode(docName, ['byPatient', patientId, sourceId]);
  clinicalDoc.setDocument(clinicalStatement);

  // create subject, value and unit indices

  createIndices.forOneRecord.call(this, patientId, sourceId, clinicalStatement);

  session.data.$(['patients', patientId, 'clinicalStatements']).delete();  // force re-fetching of updated statements

  // temporary log to check what raw data is being sent

  var log = new this.documentStore.DocumentNode('CSLog');
  var index = log.$('index').increment();
  log.$(['payload', index]).setDocument(payload);
  log.$(['payload', index, 'sourceId']).value = sourceId;

  finished({sourceId: sourceId});
}


module.exports = postStatement;
