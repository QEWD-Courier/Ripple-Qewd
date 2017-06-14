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

var uuid = require('uuid/v4');

function savePicture(args, finished) {

  /*
    {
      "name": {{picture name}}, 
      "author": {{author}}, 
      "drawing-base64": {{b64encodedstring}} 
    }

  */

  var patientId = args.patientId;

  if (typeof patientId === 'undefined' || patientId === '') {
    return finished({error: 'Missing or empty patient Id'});
  }

  var data = args.req.body;

  if (typeof data.name === 'undefined' || data.name === '') {
    return finished({error: '"name" field not defined or invalid'});
  }

  if (typeof data.author === 'undefined' || data.author === '') {
    return finished({error: '"author" field not defined or invalid'});
  }

  if (typeof data.drawingBase64 === 'undefined' || data.drawingBase64 === '') {
    return finished({error: '"drawingBase64" field not defined or invalid'});
  }

  data.drawingBase64 = data.drawingBase64.match(/.{1,4000}/g);  // split into max 4000 chunks

  var sourceId = uuid();
  data.sourceId = sourceId;
  data.dateCreated = new Date().getTime();
  data.source = 'qewdDB';

  var pictureDoc = new this.documentStore.DocumentNode('ripplePictures', ["byPatientId", patientId, sourceId]);
  
  pictureDoc.setDocument(data);

  return finished({
    ok: true,
    sourceId: sourceId
  });
}

module.exports = savePicture;
