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

var dateTime = require('../dateTime');

module.exports = {
  name: 'appointments',
  query: {
    sql: []
  },
  textFieldName: 'serviceTeam',
  headingTableFields: ['serviceTeam', 'dateOfAppointment', 'timeOfAppointment'],
  fieldMap: {
    serviceTeam: 'service_team',
    dateOfAppointment: function(data, host) {
      return dateTime.msAtMidnight(data.appointment_date, host, true);
    },
    timeOfAppointment: function(data, host) {
      //console.log('*** appointmentDate: ' + data.appointment_date);
      var d = new Date(data.appointment_date).getTime() - 3600000;
      return dateTime.msSinceMidnight(d, host, true);
    },
    location: 'location',
    status: 'status',
    author: 'author',
    dateCreated: function(data, host) {
      //console.log('*** date created: ' + data.date_created);
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    destination: 'marand',
    templateId: 'RIPPLE - Minimal referral.v0',
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

      'referral/referral_details:0/schedule_appointment/referral_to': {
        field: 'serviceTeam'
      },
      'referral/referral_details:0/schedule_appointment/appointment_schedule/lower': {
        default: function(data) {
          var apptDate = new Date(data.dateOfAppointment).getTime();
          var apptTime = dateTime.msSinceMidnight(data.timeOfAppointment) + 3600000;
          var d = dateTime.format(new Date(apptDate + apptTime));
          return d;
        }
      },
      'referral/referral_details:0/schedule_appointment/appointment_schedule/upper': {
        default: function(data) {
          var apptDate = new Date(data.dateOfAppointment).getTime();
          var apptTime = dateTime.msSinceMidnight(data.timeOfAppointment) + 7200000;
          var d = dateTime.format(new Date(apptDate + apptTime));
          return d;
        }
      },
      'referral/referral_details:0/schedule_appointment/receiver/address:0/location': {
        field: 'location'
      },
      'referral/referral_details:0/schedule_appointment/ism_transition/current_state|value': {
        field: 'status'
      },
      'referral/referral_details:0/schedule_appointment/time': {
        field: 'dateCreated'
      }
    }
  }
};
