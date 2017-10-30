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

  28 June 2017

*/

var dateTime = require('../dateTime');

var statusMap = {
  P: {
    stateCode: '526',
    stateValue: 'planned',
    careflowCode: 'at0002',
    careflowValue: 'Referral planned'
  },
  A: {
    stateCode: '529',
    stateValue: 'scheduled',
    careflowCode: 'at0003',
    careflowValue: 'Appoinment scheduled'
  },
  R: {
    stateCode: '528',
    stateValue: 'cancelled',
    careflowCode: 'at009',
    careflowValue: 'Referral cancelled'
  },
  E: {
    stateCode: '531',
    stateValue: 'aborted',
    careflowCode: 'at023',
    careflowValue: 'Referral expired'
  }
};

var priorities = {
  U: "at0136",
  E: "at0137",
  R: "at0138",
};

function helpers() {

  var helpers = {
    now: function() {
      return dateTime.now();
    },
    getRippleTime: function(date) {
      //console.log('rippleTime: date = ' + date + '; host = ' + host);
      return dateTime.getRippleTime(date, host);
    },
    msAtMidnight: function(date) {
      return dateTime.msAtMidnight(date, host, true);
    },
    msSinceMidnight: function(date) {
      var d = new Date(date).getTime() - 3600000;
      return dateTime.msSinceMidnight(d, host, true);
    },
    msAfterMidnight: function(date) {
      var d = new Date(date).getTime();
      return dateTime.msSinceMidnight(d, host);
    },
    getSource: function() {
      return host;
    },
    getCountsSource: function() {
      return host + '-counts';
    },
    getUid: function(uid) {
      return uid.split('::')[0];
    },
    integer: function(value) {
      return parseInt(value);
    },

    status_stateCode: function(status) {
      if (!statusMap[status]) return false;
      return statusMap[status].stateCode;
    },

    status_stateValue: function(status) {
      if (!statusMap[status]) return false;
      return statusMap[status].stateValue;
    },

    status_careflowCode: function(status) {
      if (!statusMap[status]) return false;
      return statusMap[status].careflowCode;
    },

    status_careflowValue: function(status) {
      if (!statusMap[status]) return '';
      return statusMap[status].careflowValue;
    },

    priority: function(value) {
      if (!priorities[value]) return '';
      return priorities[value];
    }

  };

  return helpers;
}

module.exports = helpers;
