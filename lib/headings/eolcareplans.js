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
 | Author: Will Weatherhill                                                 |
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

6 April 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'eolcareplans',
  textFieldName: 'name',
  headingTableFields: ['name', 'type', 'dateCreated'],

  get: {

    transformTemplate: {
      name: 'End of Life Care',
      type: 'Document',
      careDocument: {
        name:        'End of Life Care',
        type:        'Document',
        author:      '{{author}}',
        dateCreated: '=> getRippleTime(date_created)',
      },
      cprDecision: {
        cprDecision:    '{{cpr_decision}}',
        dateOfDecision: '=>  getRippleTime(cpr_date_of_decision)',
        comment:        '{{cpr_comment}}'
      },
      prioritiesOfCare: {
        placeOfCare: '{{priority_place_of_care}}',
        placeOfDeath: '{{priority_place_of_death}}',
        comment:      '{{priority_comment}}'
      },
      treatmentDecision: {
        decisionToRefuseTreatment: '{{treatment_decision}}',
        dateOfDecision:            '=> getRippleTime(treatment_date_of_decision)',
        comment:                   '{{treatment_comment}}'
      },
      author:           '{{author}}',
      dateCreated:      '=> getRippleTime(date_created)',
      source:           '=> getSource()',
      sourceId:         '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - End of Life Patient Preferences.v0',

    helperFunctions: {
      formatDate: function(date) {
        var startDate = new Date(date).getTime();
        return dateTime.format(startDate);
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
      end_of_life_patient_preferences: {
        legal_information: [
          {
            preferred_priorities_of_care: [
              {
                preferred_place_of_care: [
                  {
                    '|value': '{{prioritiesOfCare.placeOfCare}}',
                    '|code':  'at0008'
                  }
                ],
                preferred_place_of_death: [
                  {
                    '|value': '{{prioritiesOfCare.placeOfDeath}}',
                    '|code':  'at0018'
                  }
                ],
                comment: '{{prioritiesOfCare.comment}}'
              }
            ],
            advance_decision_to_refuse_treatment: {
              'decision_status|value': '{{treatmentDecision.decisionToRefuseTreatment}}',
              'decision_status|code':  'at0005',
              date_of_decision:        '=> formatDate(treatmentDecision.dateOfDecision)'
            },
            cpr_decision: {
              'cpr_decision|value':  '{{cprDecision.cprDecision}}',
              'cpr_decision|code':   'at0005',
              date_of_cpr_decision: '=> formatDate(cprDecision.dateOfDecision)',
              comment:               '{{cprDecision.comment}}'
            }
          }
        ]
      }
    }
  }
};
