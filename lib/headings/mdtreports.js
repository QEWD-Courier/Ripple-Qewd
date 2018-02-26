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

10 April 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'mdtreports',
  textFieldName: 'serviceTeam',
  headingTableFields: ['serviceTeam', 'dateOfRequest', 'dateOfMeeting'],

  get: {

    transformTemplate: {
      serviceTeam:     '{{service_team}}',
      dateOfRequest:   '=> getRippleTime(request_date)',
      dateOfMeeting:   '=> getRippleTime(meeting_date)',
      timeOfMeeting:   '=> msAfterMidnight(meeting_date)',
      servicePageLink: '',
      question:        '{{question}}',
      notes:           '{{notes}}',
      source:          '=> getSource()',
      sourceId:        '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - Minimal MDT Output Report.v0',

    helperFunctions: {
      formatDate: function(date) {
        return dateTime.format(new Date(date));
      }
    },

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Home")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> formatDate(dateOfMeeting)'
      },
      mdt_output_report: {
        referral_details: {
          mdt_referral: {
            request: [
              {
                _uid:           '{{sourceId}}',
                'service_name': 'MDT referral',
                'timing':       'R2/2016-12-19T18:00:00Z/P2M'
              }
            ],
            narrative:    'MDT request',
            service_team: '{{serviceTeam}}'
          },
          referral_requested: {
            ism_transition: {
              'current_state|code': '526',
              'careflow_step|code': 'at0026'
            },
            service_requested:      'MDT Referral',
            time:                   '=> formatDate(dateOfRequest)'
          }
        },
        history: {
          question_to_mdt: {
            question_to_mdt: '{{question}}'
          }
        },
        plan_and_requested_actions: {
          recommendation: {
            meeting_discussion: '{{notes}}'
          }
        }
      }
    }
  }

};
