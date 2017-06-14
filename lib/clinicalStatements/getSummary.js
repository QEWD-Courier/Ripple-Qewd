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

  12 June 2017

*/

/*

Clinical Statement Storage

  clinicalStatements('byPatient', patientId, sourceId) = 

{
    "type": "Clinical Note",
    "text": "Patient presented with shoulder pain.\r\nIf it doesn\'t improve, will need laparoscopic surgical exploration +/- repair",
    "tags": {
      "chestpain": true,
      "ortho": true
    },
    "dateCreated": 1489069889101,
    "author": "Dr John Smith",
    "source": "Ethercis"
    "data": [

      {"subject": "shoulder pain"},
      {"subject": "laparoscopic surgical exploration +/- repair"}
    ]
  }

*/


//function getSummary(patientId, session, finished) {

function getSummary(args, finished) {

  /*
  var patientCache = session.data.$(['patients', patientId, 'clinicalStatements']);

  if (patientCache.exists) {
    var summary = [];
    patientCache.forEachChild(function(sourceId, childNode) {
      var data = childNode.getDocument(true);
      summary.push({
        sourceId: data.sourceId,
        type: data.type,
        dateCreated: data.dateCreated,
        author: data.author,
        source: data.source,
      });
    });
    finished(summary);
  }
  else {
  */

    var patientId = args.patientId;

    var docName = this.userDefined.clinicalStatementsDocumentName;
    var clinicalDoc = new this.documentStore.DocumentNode(docName, ['byPatient', patientId]);
    var summary = [];
    clinicalDoc.forEachChild(function(sourceId, childNode) {
      var data = childNode.getDocument(true);
      //patientCache.$(sourceId).setDocument(data);

      summary.push({
        sourceId: data.sourceId,
        type: data.type,
        dateCreated: data.dateCreated,
        author: data.author,
        source: data.source
      });

    });
    finished(summary);
  //}
}

module.exports = getSummary;
