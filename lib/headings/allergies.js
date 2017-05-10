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

6 April 2017

*/

var heading = {
  name: 'allergies',
  textFieldName: 'cause',
  headingTableFields: ['cause', 'reaction'],

  get: {

    transformTemplate: {
      cause:               '{{cause}}',
      causeCode:           '{{cause_code}}',
      causeTerminology:    '{{cause_terminology}}',
      terminologyCode:     '{{cause_code}}',
      reaction:            '{{reaction}}',
      author:              '{{author}}',
      dateCreated:         '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)',
      originalComposition: '{{originalComposition}}',
      originalSource:      '{{originalSource}}'
    }

  },

  post: {
    templateId: 'IDCR - Adverse Reaction List.v1',

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
      adverse_reaction_list: {
        allergies_and_adverse_reactions: {
          adverse_reaction_risk: [
            {
              'causative_agent|value':       '{{cause}}',
              'causative_agent|code':        '{{causeCode}}',
              'causative_agent|terminology': '{{causeTerminology}}',
              reaction_details: {
                manifestation: [
                  '{{reaction}}'
                ]
              },
              "_provider|name": '=> either(originalComposition, "<!delete>")',
              "_provider|id":   '=> either(originalSource, "<!delete>")',
            }
          ]
        }
      }
    }
  }
};

module.exports = heading;
