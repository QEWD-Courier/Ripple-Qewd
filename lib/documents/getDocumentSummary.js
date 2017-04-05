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

var getSummary = require('./getSummary');

function getResponse(resultsObj) {
  var results = [];
  var record;
  var result;

  for (var id in resultsObj) {
    record = resultsObj[id];
    result = {
      sourceId: id,
      dateCreated: record.dateCreated,
      author: record.author,
      documentType: record.documentType,
      source: record.source
    };
    results.push(result);
  }
  return results;
}


function getDocumentSummary(args, finished) {

  console.log('*** getDocumentSummary!');

  var cachedSummary = args.session.data.$(['patients', args.patientId, 'documents', 'summary']);

  if (cachedSummary.exists) {
    var response = getResponse(cachedSummary.getDocument(true));
    return finished(response);
  }

  getSummary(args, function(results) {
    if (!results.error) {
      var document = {};
      results.forEach(function(result) {
        var sourceId = result.uid.split('::')[0];
        document[sourceId] = result;
      });

      cachedSummary.setDocument(document);
      var response = getResponse(document);
      return finished(response);
    }
    return finished(results);
  });
}

module.exports = getDocumentSummary;
