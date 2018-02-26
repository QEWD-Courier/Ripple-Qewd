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

  3 November 2017

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var headings = headingsLib.headings;
var transform = require('qewd-transform-json').transform;
var flatten = require('../objectToFlatJSON');
var dateTime = require('../dateTime');

function deleteSessionCaches(patientId, heading, currentSessionId) {

  // delete cached heading data in all active sessions

  var sessions = this.sessions.active();
  sessions.forEach(function(session) {
    if (session.id !== currentSessionId) {
      session.data.$(['patients', patientId, 'headings', heading]).delete();
      session.data.$(['patients', patientId, 'headingIndex', heading]).delete();  
    }
  });
}

function putHeading(args, callback) {

  var nhsNo = args.patientId;
  var sourceId = args.sourceId;

  if (nhsNo === 'null') {
    return callback({error: 'A null patientId was specified in the request'});
  }

  if (nhsNo === 'undefined') {
    return callback({error: 'PatientId was specified as undefined in the request'});
  }

  var heading = args.heading;
  var data = args.req.body;
  var ewdSession = args.session;

  var cachedPatient = ewdSession.data.$(['patients', nhsNo]);
  var headingIndex = cachedPatient.$(['headingIndex', heading, sourceId]);
  if (!headingIndex.exists) {
    return callback({error: 'No existing ' + heading + ' record found for sourceId: ' + sourceId});
  }
  var host = headingIndex.$('host').value;
  var recNo = headingIndex.$('recNo').value;
  var cachedData = cachedPatient.$(['headings', heading, host, recNo]).getDocument(true);
  var uid = cachedData.uid;
  if (uid === '') {
    return callback({error: 'Full uid not found in session cache for ' + heading + ' record with sourceId: ' + sourceId});
  }

  // get existing values for any fields not returned from UI

  for (var field in cachedData) {
    if (field !== 'uid') {
      if (typeof data[field] === 'undefined') data[field] = cachedData[field];
    }
  }

  if (headings[heading] && headings[heading].post) {
    var q = this;
    openEHR.startSession(host, ewdSession, function(session) {
      //console.log('**** inside startSession callback - sessionId = ' + session.id);
      // force a reload of this heading after the update
      cachedPatient.$(['headings', heading]).delete();
      cachedPatient.$(['headingIndex', heading]).delete();
      putHeadingData.call(q, heading, uid, host, session.id, data, function() {
        openEHR.stopSession(host, session.id, ewdSession);
        if (callback) callback({info: heading + ' updated'});  
      });
    });
    // delete any cached data for this patient and heading for all other active sessions
    deleteSessionCaches.call(this, nhsNo, heading);
  }
  else {
    console.log('*** Heading ' + heading + ' either not recognised, or no POST definition available');
    callback({error: 'heading ' + heading + ' not recognised, or no POST definition available'});
  }
}

function putHeadingData(heading, uid, host, sessionId, data, callback) {
  if (headings[heading] && headings[heading].post) {
    var post = headings[heading].post;

    var helpers = post.helperFunctions || {};
    helpers.now = dateTime.now;

    var output = transform(post.transformTemplate, data, helpers);
    var body = flatten(output);

    // ready to post
    var params = {
      host: host,
      callback: callback,
      url: '/rest/v1/composition/' + uid,
      queryString: {
        templateId: post.templateId,
        format: 'FLAT'
      },
      method: 'PUT',
      session: sessionId,
      options: {
        body: body
      }
    };
    console.log('**** about to PUT data: ' + JSON.stringify(params, null, 2));
    openEHR.request(params);
  }
}

module.exports = putHeading;
