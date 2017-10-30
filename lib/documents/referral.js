
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
 | Author: Will Weatherill                                                  |
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

  10 March 2017

*/


var referralTemplate = {
  ctx: {
    composer_name:               '{{REF_I12.MSH["MSH.4"]["HD.1"]}}',
    'health_care_facility|id':   '{{REF_I12.MSH["MSH.4"]["HD.2"]}}',
    'health_care_facility|name': '{{REF_I12["REF_I12.PROVIDER_CONTACT"][0].PRD["PRD.4"]["PL.1"]}}',
    id_namespace:                'iEHR',
    id_scheme:                   'iEHR',
    language:                    'en',
    territory:                   'GB',
    time:                        '{{REF_I12.MSH["MSH.7"]["TS.1"]}}'
  },
  referral: {
    referral_details: {
      service_request: {
        referred_to_provider: {
          identifier:            '{{REF_I12.MSH["MSH.6"]["HD.1"]}}',
          name_of_organisation:  '{{REF_I12["REF_I12.PROVIDER_CONTACT"][0].PRD["PRD.3"]["XAD.2"]}}'
        },
        referral_control_number: '{{REF_I12.MSH["MSH.10"]}}',
        request: [
          {
            timing:              'Boilerplate timing string',
            referral_type:       '{{REF_I12.RF1["RF1.3"]["CE.1"]}}',
            'priority|code':     '=> priority(REF_I12.RF1["RF1.3"]["CE.2"])',
            comments:            '{{REF_I12.RF1["RF1.3"]["CE.2"]}}'
          }
        ],
        narrative:               '{{REF_I12.RF1["RF1.3"]["CE.1"]}}',
        referring_provider: {
          identifier:            '{{REF_I12.RF1["RF1.6"]["EI.1"]}}',
          name_of_organisation:  '{{REF_I12["REF_I12.PROVIDER_CONTACT"][0].PRD["PRD.4"]["PL.1"]}}'
        },
        distribution: [
          {
            individual_recipient: [
              {
                gp: {
                  name_of_organisation: '{{REF_I12["REF_I12.PROVIDER_CONTACT"][0].PRD["PRD.4"]["PL.1"]}}'
                }
              }
            ]
          }
        ]
      },
      referral_status: {
        ism_transition: {
          'current_state|code':  '=> status_stateCode(REF_I12.RF1["RF1.1"]["CE.1"])',
          'current_state|value': '=> status_stateValue(REF_I12.RF1["RF1.1"]["CE.1"])',
          'careflow_step|code':  '=> status_careflowCode(REF_I12.RF1["RF1.1"]["CE.1"])',
          'careflow_step|value': '=> status_careflowValue(REF_I12.RF1["RF1.1"]["CE.1"])'
        },
        referral_type:           '{{REF_I12.RF1["RF1.3"]["CE.1"]}}',
        time:                    '{{REF_I12.RF1["RF1.7"]["TS.1"]}}'
      }
    }
  }
};

module.exports = referralTemplate;

