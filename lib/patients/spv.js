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

  20 June 2017

 Single Patient View module

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var dicom = require('../dicom/dicom');

var patientSummary = require('./patientSummary');
var patientHeadingTable = require('./patientHeadingTable');
var patientHeadingDetail = require('./patientHeadingDetail');
var postHeading = require('./postHeading');


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
    console.log('** spv.getHeadingTable: ' + JSON.stringify(args));

    if (args.patientId === 'null') {
      callback({error: 'A null patientId was specified in the request'});
      return;
    }

    patientHeadingTable.call(this, args, args.patientId, args.heading, args.session, callback)
  },

  postHeading:  function(args, callback) {
    console.log('** spv.postHeading: ' + JSON.stringify(args));
    if (args.patientId === 'null') {
      callback({error: 'A null patientId was specified in the request'});
      return;
    }

    postHeading.call(this, args.patientId, args.heading, args.req.body, args.session, callback)
  },

  getHeadingDetail: function(args, callback) {

    if (args.heading === 'dicom') {
      dicom.studies.call(this, args, callback);
      return;
    }

    var results = patientHeadingDetail.call(this, args.patientId, args.heading, args.sourceId, args.session);
    callback(results);
  },

  probablyDicomL2: function(args, callback) {

    if (args.heading === 'dicom') {
      console.log('dicom: args = ' + JSON.stringify(args));
      dicom.detailL2.call(this, args, callback);
      return;
    }

    var results = patientHeadingDetail.call(this, args.patientId, args.heading, args.sourceId, args.session);
    callback(results);
  },

  probablyDicomL3: function(args, callback) {

    if (args.heading === 'dicom') {
      console.log('dicom: args = ' + JSON.stringify(args));
      dicom.detailL3.call(this, args, callback);
      return;
    }

    var results = patientHeadingDetail.call(this, args.patientId, args.heading, args.sourceId, args.session);
    callback(results);
  }

};
