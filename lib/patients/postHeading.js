/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
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

 4 November 2016

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var headings = headingsLib.headings;

function postHeading(nhsNo, heading, dataArr, ewdSession, callback) {
  if (headings[heading] && headings[heading].post) {
    var q = this;
    if (!Array.isArray(dataArr)) dataArr = [dataArr];
    var total = dataArr.length;
    var count = 0;
    dataArr.forEach(function(data) {
      var host = headings[heading].post.destination || 'ethercis';
      var session = {
        id: ewdSession.data.$('openEHR').$(host).value
      };
      //openEHR.startSession(host, function(session) {
        console.log('**** inside startSession callback - sessionId = ' + session.id);
        openEHR.mapNHSNoByHost(nhsNo, host, session.id, function(ehrId) {
          // force a reload of this heading after the update
          var patient = ewdSession.data.$('patients').$(nhsNo);
          patient.$('headings').$(heading).delete();
          patient.$('headingIndex').$(heading).delete();
          postHeadingData.call(q, heading, ehrId, host, session.id, data, function() {
            //openEHR.stopSession(host, session.id);
            count++;
            if (callback && count === total) callback({info: heading + ' saved'});  
          });
        });
      //});
    });
  }
}

function postHeadingData(heading, ehrId, host, sessionId, data, callback) {
  if (headings[heading] && headings[heading].post) {
    var body = {};
    var post = headings[heading].post;
    var fieldMap = post.fieldMap;
    var map;
    for (var fieldName in fieldMap) {
      console.log('** ' + fieldName);
      map = fieldMap[fieldName];
      console.log('** map: ' + JSON.stringify(map));
      var mapped = false;
      if (map.field) {
        if (data[map.field]) {
          console.log('** body[' + fieldName + '] = ' + data[map.field]);
          body[fieldName] = data[map.field];
          mapped = true;
        }
      }
      if (!mapped && map.default) {
        if (typeof map.default === 'function') {
          body[fieldName] = map.default(data, host);
        }
        else {
          body[fieldName] = map.default;
        }
        console.log('*** default: body[' + fieldName + '] = ' + map.default);
      }
    }
    // ready to post
    var params = {
      host: host,
      callback: callback,
      url: '/rest/v1/composition',
      queryString: {
        templateId: post.templateId,
        ehrId: ehrId,
        format: 'FLAT'
      },
      method: 'POST',
      session: sessionId,
      options: {
        body: body
      }
    };
    console.log('**** about to post data: ' + JSON.stringify(params, null, 2));
    openEHR.request(params);
  }
}

module.exports = postHeading;
