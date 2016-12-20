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
  name: 'medications',
  textFieldName: 'name',
  headingTableFields: ['name', 'doseAmount'],
  fieldMap: {
    name: 'name',
    doseAmount: 'dose_amount',
    doseDirections: 'dose_directions',
    doseTiming: 'dose_timing',
    route: 'route',
    startDate: function(data, host) {
      return dateTime.getRippleTime(data.start_date, host);
    },
    startTime: function(data, host) {
      return dateTime.msSinceMidnight(data.start_date, host);
    },
    medicationCode: 'medication_code',
    medicationTerminology: 'medication_terminology',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'LCR Medication List.v0',
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
        default: 'Rippleburgh GP Practice'
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
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/medication_name|value': {
        field: 'name'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/medication_name|code': {
        field: 'medicationCode'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/medication_name|terminology': {
        field: 'medicationTerminology'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/route': {
        field: 'route'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/dose_amount_description': {
        field: 'doseAmount'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/dose_timing_description': {
        field: 'doseTiming'
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/course_details/start_datetime': {
        default: function(data) {
          var startDate = new Date(data.startDate).getTime();
          var startTime = dateTime.msSinceMidnight(data.startTime);
          var startDateTime = dateTime.format(new Date(startDate + startTime));
          return startDateTime;
        }
      },
      'current_medication_list/medication_and_medical_devices:0/current_medication:0/medication_statement:0/medication_item/dose_directions_description': {
        field: 'doseDirections'
      }
    }
  }
};
