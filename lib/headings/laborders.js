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

module.exports = {
  name: 'laborders',
  textFieldName: 'name',
  headingTableFields: ['name', 'orderDate'],

  get: {

    transformTemplate: {
      name:        '{{name}}',
      code:        '{{code}}',
      terminology: '{{terminology}}',
      orderDate:   '=> getRippleTime(date_ordered)',
      author:      '{{author}}',
      dateCreated: '=> getRippleTime(date_created)',
      source:      '=> getSource()',
      sourceId:    '=> getUid(uid)'
    }

  },

  post: {
    // destination: 'ethercis',
    templateId: 'IDCR - Laboratory Order.v0',

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Northumbria Community NHS")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      laboratory_order: {
        laboratory_test_request: {
          request: {
            'service_requested|code':        '{{code}}',
            'service_requested|value':       '{{name}}',
            'service_requested|terminology': '=> either(terminology, "SNOMED-CT")',
            timing:                          'R5/2015-08-12T22:00:00+02:00/P2M',
            'timing|formalism':              'timing',
          },
          narrative:                         '{{name}}'
        },
        laboratory_test_tracker: {
          ism_transition: {
            'current_state|code':            '526',
            'current_state|value':           'planned',
            'current_state|terminology':     'openehr',
            'careflow_step|code':            'at0003',
            'careflow_step|value':           'Test Requested',
            'careflow_step|terminology':     'local'
          },
          'test_name|code':                  '{{code}}',
          'test_name|value':                 '{{name}}',
          'test_name|terminology':           '=> either(terminology, "SNOMED-CT")',
        }
      }
    }
  }
};
