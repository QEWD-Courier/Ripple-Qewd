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

18 October 2016

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'mdtreports',
  query: {
    sql: []
  },
  textFieldName: 'name',
  headingTableFields: ['serviceTeam', 'dateOfRequest', 'dateOfMeeting'],
  fieldMap: {
    serviceTeam: 'service_team',
    dateOfRequest: function(data, host) {
      return dateTime.getRippleTime(data.request_date, host);
    },
    dateOfMeeting: function(data, host) {
      return dateTime.getRippleTime(data.meeting_date, host);
    },
    timeOfMeeting: function(data, host) {
      return dateTime.msSinceMidnight(data.meeting_date, host);
    },
    servicePageLink: function() {
      return null;
    },
    question: 'question',
    notes: 'notes'
  }
};
