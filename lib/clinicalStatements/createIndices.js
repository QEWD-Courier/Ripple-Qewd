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

  16 March 2017

*/


function indexOneRecord(patientId, sourceId, statementObj) {

  if (typeof patientId === 'undefined' || patientId === '' || typeof sourceId  === 'undefined' || sourceId === '' || !statementObj) return;

  console.log('statementObj = ' + JSON.stringify(statementObj));

  var docName = this.userDefined.clinicalStatementsDocumentName;

  var dateCreated = statementObj.dateCreated;

  new this.documentStore.DocumentNode(docName, ['bySourceId', sourceId]).value = patientId;
  if (dateCreated && dateCreated !== '') {
    new this.documentStore.DocumentNode(docName, ['byDateCreated', dateCreated, patientId, sourceId]).value = '';
  }

  var byTagIndex = new this.documentStore.DocumentNode(docName, ['byTag']);

  var tags = statementObj.tags;
  if (tags) {
    for (var tag in tags) {
      byTagIndex.$([tag, patientId, sourceId]).value = '';
    }
  }

  var bySubjectIndex = new this.documentStore.DocumentNode(docName, ['bySubject']);
  var byValueIndex = new this.documentStore.DocumentNode(docName, ['byValue']);
  var byUnitIndex = new this.documentStore.DocumentNode(docName, ['byUnit']);
 
  if (statementObj.phrases) {
    statementObj.phrases.forEach(function(phrase) {
      if (phrase.subject && phrase.subject !== '') {
        bySubjectIndex.$([phrase.subject, patientId, sourceId]).value = '';
      }
      if (phrase.value && phrase.value !== '') {
        byValueIndex.$([phrase.value, patientId, sourceId]).value = '';
      }
      if (phrase.unit && phrase.unit !== '') {
        byUnitIndex.$([phrase.unit, patientId, sourceId]).value = '';
      }
    });
  }

}

function reIndex() {

  console.log('reIndex - this: ' + JSON.stringify(this, null, 2));
  console.log('reIndex - this.userDefined: ' + JSON.stringify(this.userDefined, null, 2));

  var docName = this.userDefined.clinicalStatementsDocumentName;
  var clinicalStatementsDoc = new this.documentStore.DocumentNode(docName);

  clinicalStatementsDoc.$('bySourceId').delete();
  clinicalStatementsDoc.$('bySubject').delete();
  clinicalStatementsDoc.$('byTag').delete();
  clinicalStatementsDoc.$('byValue').delete();
  clinicalStatementsDoc.$('byUnit').delete();
  clinicalStatementsDoc.$('byDateCreated').delete();

  var self = this;
  clinicalStatementsDoc.$('byPatient').forEachChild(function(patientId, patientStatements) {
    patientStatements.forEachChild(function(sourceId, statementNode) {
      var statement = statementNode.getDocument(true);
      indexOneRecord.call(self, patientId, sourceId, statement);
    });
  });

}

module.exports = {
  forOneRecord: indexOneRecord,
  reIndex: reIndex
}
