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

18 May 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'appointments',
  textFieldName: 'serviceTeam',
  headingTableFields: ['serviceTeam', 'dateOfAppointment', 'timeOfAppointment'],

  get: {

    transformTemplate: {
      serviceTeam:       '{{service_team}}',
      dateOfAppointment: '=> msAtMidnight(appointment_date)',
      timeOfAppointment: '=> msSinceMidnight(appointment_date)',
      location:          '{{location}}',
      status:            '{{status}}',
      author:            '{{author}}',
      dateCreated:       '=> getRippleTime(date_created)',
      source:            '=> getSource()',
      sourceId:          '=> getUid(uid)'
    }
  },

  post: {

    templateId: 'RIPPLE - Minimal referral.v0',
    destination: 'marand',

    helperFunctions: {
      getLowerDateTime: function(appointmentDate, appointmentTime) {
        if (!appointmentDate || !appointmentTime) return '';
        var apptDate = new Date(appointmentDate).getTime();
        var apptTime = dateTime.msSinceMidnight(appointmentTime) + 3600000;
        return dateTime.format(new Date(apptDate + apptTime));
      },
      getUpperDateTime: function(appointmentDate, appointmentTime) {
        if (!appointmentDate || !appointmentTime) return '';
        var apptDate = new Date(appointmentDate).getTime();
        var apptTime = dateTime.msSinceMidnight(appointmentTime) + 7200000;
        return dateTime.format(new Date(apptDate + apptTime));
      }
    },

    transformTemplate: {
      ctx: {
        composer_name: '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id': '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Rippleburgh GP Practice")',
        id_namespace: 'NHS-UK',
        id_scheme: '2.16.840.1.113883.2.1.4.3',
        language: 'en',
        territory: 'GB',
        time: '=> now()'
      },
      referral: {
        referral_details: [
          {
            schedule_appointment: {
              referral_to: '{{serviceTeam}}',
              appointment_schedule: {
                lower: '=> getLowerDateTime(dateOfAppointment, timeOfAppointment)',
                upper: '=> getUpperDateTime(dateOfAppointment, timeOfAppointment)',
              },
              receiver: {
                address: [
                  {
                    location: '{{location}}'
                  }
                ]
              },
              ism_transition: {
                'current_state|value': '{{status}}'
              },
              time: '{{dateCreated}}'
            }
          }
        ]
      }
    }
  }
};
