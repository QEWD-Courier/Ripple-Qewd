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

  27 November 2017

*/

var dateTime = require('../dateTime')

var heading = {
  name: 'vaccinations',
  textFieldName: 'vaccinationName',
  headingTableFields: ['vaccinationName', 'dateCreated'],

  get: {

    transformTemplate: {
      vaccinationName:     '{{vaccination_name}}',
      comment:             '{{comment}}',
      series:              '{{series_number}}',
      vaccinationDateTime: '=> getRippleTime(vaccination_time)',
      author:              '{{author}}',
      dateCreated:         '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - Immunisation summary.v0',

    helperFunctions: {
      formatDate: function(date) {
        return dateTime.format(new Date(date));
      }
    },

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Ripple View Care Home")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      immunisation_summary: {
        immunisation_procedure: [
          {
            ism_transition: {
              'current_state|code': '532',
            },
            immunisation_name:      '{{vaccinationName}}',
            series_number:          '{{series}}',
            comment:                '{{comment}}',
            time:                   '=> formatDate(vaccinationDateTime)'
          }
        ]
      }
    }
  }
};

module.exports = heading;

