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


var getDetail = require('./getDetail');

function getDocumentDetail(args, finished) {

  console.log('getDocumentDetail');

  var cachedDetail = args.session.data.$(['patients', args.patientId, 'documents', 'detail', args.sourceId]);

  if (cachedDetail.exists) {
    var response = cachedDetail.getDocument(true);
    return finished(response);
  }

  getDetail(args, function(results) {
    if (!results.error) {
      cachedDetail.setDocument(results);
    }
    return finished(results);
  });
}

module.exports = getDocumentDetail;
