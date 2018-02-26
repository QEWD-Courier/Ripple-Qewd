/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

 1 November 2018

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'medications',
  textFieldName: 'medication_name',
  headingTableFields: ['name', 'doseAmount', 'dateCreated'],


  get: {

    transformTemplate: {
      name:                  '{{medication_name}}',
      doseAmount:            '{{dose_amount}}',
      doseDirections:        '{{dose_directions}}',
      doseTiming:            '{{dose_timing}}',
      route:                 '{{route}}',
      startDate:             '=> getRippleTime(start_date)',
      startTime:             '=> msAfterMidnight(start_date)',
      medicationCode:        '{{medication_name_code}}',
      medicationTerminology: '{{medication_name_terminology}}',
      author:                '{{author}}',
      dateCreated:           '=> getRippleTime(date_created)',
      source:                '=> getSource()',
      sourceId:              '=> getUid(uid)'
    }
  },

  post: {
    templateId: 'IDCR - Medication Statement List.v0',
    destination: 'marand',

    helperFunctions: {
      getStartDateTime: function(date, time) {
        //var startDate = new Date(date).getTime();
        //var startTime = dateTime.msSinceMidnight(time);
        //return dateTime.format(new Date(startDate + startTime));
        console.log('getStartDateTime: ' + date + '; ' + time);
        //var date = dateTime.msAtMidnight(date);
        return dateTime.format(new Date(date + time));
      },
      getNarrative: function(name, route, doseAmount, doseTiming) {
        return name + ' - ' + route + ' - ' + doseAmount + ' ' + doseTiming;
      }
    },

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Rippleburgh GP Practice")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      medication_statement_list: {
        medication_and_medical_devices: {
          medication_order: [
            {
              order: [
                {
                  'medication_item|value':       '{{name}}',
                  'medication_item|code':        '{{medicationCode}}',
                  'medication_item|terminology': '{{medicationTerminology}}',
                  'additional_instruction:0':    '{{doseDirections}}',
                  route:                           '{{route}}',
                  dose_amount_description:         '{{doseAmount}}',
                  dose_timing_description:         '{{doseTiming}}',
                  order_details: {
                    order_start_date_time:         '=> getStartDateTime(startDate, startTime)',
                    order_summary: {
                      'course_status|code':        'at0021'
                    }
                  },
                  timing:                         'R5/2017-06-26T10:00:00Z/P1M'
                }
              ],
              narrative:                          '=> getNarrative(name, route, doseAmount, doseTiming)'
            }
          ]
        }
      }
    }
  }
};
