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

4 August 2017

*/

module.exports = {
  name: 'referrals',
  textFieldName: 'referral_from',
  headingTableFields: ['dateOfReferral', 'referralFrom', 'referralTo'],

  get: {

    transformTemplate: {
      referralType:        '{{referral_type}}',
      referralReason:      '{{referral_reason}}',
      referralSummary:     '{{clinical_summary}}',
      referralFrom:        '{{referralFrom}}',
      referralTo:          '{{referralTo}}',
      referralRef:         '{{referral_ref}}',
      referralOutcome:     '{{outcome}}',
      referralStateDate:   '=> getRippleTime(dateOfState)',
      referralState:       '{{state}}',
      referralStateCode:   '{{stateCode}}',
      referralCareFlow:    '{{careflow}}',
      referralServiceName: '{{service_name}}',
      author:              '{{author}}',
      dateOfReferral:      '=> getRippleTime(date_created)',
      dateCreated:         '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)'
    }

  },

  post: {

    // Default to Marand - EtherCIS not ready for Referrals yet - 24-Feb-2017
    //destination: 'marand',

    templateId: 'IDCR - Service Request.v0',

    helperFunctions: {
      getNarrative: function(referralReason) {
        return 'Referral To: ' + referralReason;
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
      request_for_service: {
        referral_details: {
          service_request: [
            {
              request: [
                {
                  service_name:       '=> either(referralServiceName, "Referral To")',
                  reason_for_request: '{{referralReason}}',
                  reason_description: '{{referralSummary}}',
                  timing:             '=> either(referralStateDate, "12345")',
                  'timing|formalism': 'timing',
                }
              ],
              requestor: {
                person_name: {
                  unstructured_name:  '{{referralFrom}}',
                }
              },
              receiver_identifier:    '{{referralRef}}',
              receiver: {
                name_of_organisation: '{{referralTo}}'
              },
              narrative:              '=> getNarrative(referralReason)'
            }
          ],
          service: [
            {
              receiver_identifier:    '{{referralRef}}',
              ism_transition: {
                'current_state|code': '526',
                'careflow_step|code': 'at0026'
              },
              service_name:           '=> either(referralServiceName, "Referral To")'
            }
          ]
        }
      }
    }
  }
};
