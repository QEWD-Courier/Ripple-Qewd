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
var postHeading = require('./postHeading');
var advancedSearch = require('./advancedSearch');


module.exports = {

  init: function() {
    openEHR.init.call(this);
    headingsLib.init.call(this);
    patientSummary.init.call(this);
  },

  getPatientSummary: function(args, callback) {
    if (args.patientId === 'advancedSearch') {
      advancedSearch.call(this, args, callback);
      return;
    }
    patientSummary.get.call(this, args.patientId, args.session, callback);
  },
  getHeadingTable:  function(args, callback) {
    console.log('** spv.getHeadingTable: ' + JSON.stringify(args));
    if (args.patientId === 'null') {
      callback({error: 'A null patientId was specified in the request'});
      return;
    }
    if (args.res.method === 'POST') {
      postHeading.call(this, args.patientId, args.heading, args.res.body, args.session, callback)
    }
    else {
      patientHeadingTable.call(this, args.patientId, args.heading, args.session, callback)
    }
  },

  getHeadingDetail: function(args, callback) {
    var results = patientHeadingDetail.call(this, args.patientId, args.heading, args.sourceId, args.session);
    callback(results);
  },
  postHeading: postHeading
};
