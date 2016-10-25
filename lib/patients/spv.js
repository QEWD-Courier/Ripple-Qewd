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

 21 September 2016

 Single Patient View module

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');

var patientSummary = require('./patientSummary');
var patientHeadingTable = require('./patientHeadingTable');
var patientHeadingDetail = require('./patientHeadingDetail');

var headings = headingsLib.headings;


function postHeading(nhsNo, heading, dataArr, callback) {
  if (headings[heading] && headings[heading].post) {
    var q = this;
    if (!Array.isArray(dataArr)) dataArr = [dataArr];
    dataArr.forEach(function(data) {
      var host = headings[heading].post.destination || 'ethercis';
      openEHR.startSession(host, function(session) {
        console.log('**** inside startSession callback - sessionId = ' + session.id);
        openEHR.mapNHSNoByHost(nhsNo, host, session.id, function(ehrId) {
          // force a reload of this heading after the update
          var patientHeading = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, 'headings', headings[heading].name]);
          var patientHeadingIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, 'headingIndex', headings[heading].name]);
          patientHeading.delete();
          patientHeadingIndex.delete();
          postHeadingData.call(q, heading, ehrId, host, session.id, data, function() {
            openEHR.stopSession(host, session.id);
            if (callback) callback();  
          });
        });
      });
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


module.exports = {

  init: function() {
    openEHR.init.call(this);
    headingsLib.init.call(this);
    patientSummary.init.call(this);
  },

  getPatientSummary: function(args, callback) {
    patientSummary.get.call(this, args.patientId, args.session, callback);
  },
  getHeadingTable:  function(args, callback) {
    patientHeadingTable.call(this, args.patientId, args.heading, args.session, callback)
  },

  getHeadingDetail: function(args, callback) {
    var results = patientHeadingDetail.call(this, args.patientId, args.heading, args.sourceId, args.session);
    callback(results);
  },
  postHeading: postHeading
};
