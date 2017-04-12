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
 | Author: Dinesh Patel - Leidos                                            |
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

 07 February 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'procedures',
  textFieldName: 'procedure_name',
  headingTableFields: ['name', 'date', 'time'],
  fieldMap: {
    name: 'procedure_name',
    procedureName: 'procedure_name',
    procedureCode: 'procedure_code',
    date: function(data, host) {
      return dateTime.getRippleTime(data.procedure_datetime, host);
    },
    time: function(data, host) {
      return dateTime.msSinceMidnight(data.procedure_datetime, host);
    },
    procedureTerminology: 'procedure_terminology',
    notes: 'procedure_notes',
    performer: 'performer',
    currentStatus: 'procedure_state',
    author: 'author',
    dateSubmitted: function(data, host) {
      return dateTime.getRippleTime(data.date_submitted, host);
    }
  },
  post: {
    // destination: 'ethercis',
    templateId: 'IDCR - Procedures List.v1',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',
        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        field: 'healthcareFacilityId',
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        field: 'healthcareFacilityName',
        default: 'Rippleburgh General Hospital'
      },
      'ctx/id_namespace': {
        default: 'NHS-UK'
      },
      'ctx/id_scheme': {
        default: '2.16.840.1.113883.2.1.4.3'
      },
      'ctx/language': {
        default: 'en'
      },
      'ctx/territory': {
        default: 'GB'
      },
      'ctx/time': {
        field: 'dateTimeRecorded',
        default: function(data) {
          return dateTime.format(new Date());
        }
      },
      'procedures_list/procedures/procedure:0/procedure_name|value': {
        field: 'procedureName'
      },
      'procedures_list/procedures/procedure:0/procedure_notes': {
        field: 'notes'
      },
      'procedures_list/procedures/procedure:0/ism_transition/current_state|value': {
        field: 'status'
       },
      'procedures_list/procedures/procedure:0/ism_transition/careflow_step|code': {
        default: 'at0043'
      },
      'procedures_list/procedures/procedure:0/procedure_name|terminology': {
        default: 'SNOMED-CT'
      },
      'procedures_list/procedures/procedure:0/procedure_name|code' : {
        field: 'procedureCode'
      },
      'procedures_list/procedures/procedure:0/_other_participation:0|name': {
        default: 'Performer'
      },
      'procedures_list/procedures/procedure:0/_other_participation:0|function': {
        field: 'performer'
      },
      'procedures_list/procedures/procedure:0/time': {
        default: function(data) {
          var date = new Date(data.date);
          var time = new Date(data.time);
          var dt = new Date(date.toDateString() + ' ' + time.toTimeString());
          return dateTime.format(dt);
        }
      }
    }
  }
};
