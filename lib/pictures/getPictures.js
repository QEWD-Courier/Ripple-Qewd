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

  9 June 2017

*/


function getPictures(args, finished) {

  /*
   [
     {"name": "test", "date": "20-Dec-2016", "source": "qewdDB", "sourceId": "xxxxxxx"}
   ]

  */

  var patientId = args.patientId;

  if (typeof patientId === 'undefined' || patientId === '') {
    return finished({error: 'Missing or empty patient Id'});
  }
  var picturesDoc = new this.documentStore.DocumentNode('ripplePictures', ["byPatientId", patientId]);
  if (!picturesDoc.exists) {
    return finished([]);
  }
  var results = [];
  var result;
  picturesDoc.forEachChild(function(sourceId, pictureDoc) {
    result = pictureDoc.getDocument(true);
    results.push({
      name: result.name,
      dateCreated: result.dateCreated,
      source: result.source,
      sourceId: sourceId
    });
  });

  return finished(results);
}

module.exports = getPictures;
