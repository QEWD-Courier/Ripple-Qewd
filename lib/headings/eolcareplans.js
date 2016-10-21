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

18 October 2016

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'careplans',
  query: {
    sql: []
  },
  textFieldName: 'name',
  headingTableFields: ['name', 'type', 'dateCreated'],
  fieldMap: {
    name: function(record) {
      return 'End of Life Care';
    },
    type: function(record) {
      return 'Document';
    },
    careDocument: function(record, host) {
      return {
        name: 'End of Life Care',
        type: 'Document',
        author: record.author,
        dateCreated: dateTime.getRippleTime(record.date_created, host)
      };
    },
    cprDecision: function(record, host) {
      return {
        cprDecision: record.cpr_decision,
        dateOfDecision: dateTime.getRippleTime(record.cpr_date_of_decision, host),
        comment: record.cpr_comment
      };
    },
    prioritiesOfCare: function(record) {
      return {
        placeOfCare: record.priority_place_of_care,
        placeOfDeath: record.priority_place_of_death,
        comment: record.priority_comment
      };
    },
    treatmentDecision: function(record, host) {
      return {
        decisionToRefuseTreatment: record.treatment_decision,
        dateOfDecision: dateTime.getRippleTime(record.treatment_date_of_decision, host),
        comment: record.treatment_comment
      };
    },
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
