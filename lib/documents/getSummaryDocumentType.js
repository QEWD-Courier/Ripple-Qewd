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

var openEHR = require('../openEHR/openEHR');
var getAQL = require('./getAQL');

function getSummaryDocumentType(patientId, templateId, aqlTemplate, openEHRSessions, callback) {
  var params = {
    url: '/rest/v1/query',
    method: 'GET',
    sessions: openEHRSessions
  };

  // build queries to retrieve document composition Ids from each openEHR host    
  params.hostSpecific = {};

  var ehrId;

  for (var host in openEHR.servers) {
    ehrId = openEHR.getEhrId(patientId, host);

    params.hostSpecific[host] = {
      qs: {
        aql: getAQL(aqlTemplate, ehrId, templateId)
      }
    };
  }

  params.callback = callback;

  var results = [];

  params.processBody = function (body, host) {
    body.resultSet.forEach(function(result) {
      result.source = host;
      results.push(result);
    });
  };

  // run the query for this doc type

  openEHR.requests(params, results);
}

module.exports = getSummaryDocumentType;
