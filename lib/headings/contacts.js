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

3 November 2017

*/

module.exports = {
  name: 'contacts',
  textFieldName: 'name',
  headingTableFields: ['name', 'relationship', 'nextOfKin'],

  get: {

    transformTemplate: {
      name:                    '{{name}}',
      relationship:            '{{relationshipRoleType}}',
      relationshipType:        '{{relationshipCategory}}',
      relationshipCode:        '{{relationshipCategoryCode}}',
      relationshipTerminology: '{{relationshipCategoryTerminology}}',
      contactInformation:      '{{contactInformation}}',
      nextOfKin:               '{{next_of_kin}}',
      notes:                   '{{notes}}',
      author:                  '{{author}}',
      dateCreated:             '=> getRippleTime(dateCreated)',
      source:                  '=> getSource()',
      sourceId:                '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - Relevant contacts.v0',

    helperFunctions: {
      getNokResponse: function(nextOfKin) {
        if (!nextOfKin) return '<!delete>'; // remove POSTed field if false
        return nextOfKin;
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
      relevant_contacts_list: {
        relevant_contacts: {
          relevant_contact: [
            {
              individual_person: {
                person_name: {
                  unstructured_name: '{{name}}'
                },
                contact_details: [
                  {
                    comms_description: '{{contactInformation}}'
                  }
                ]
              },
              'relationship_category|code': '{{relationshipCode}}',
              relationship_role: '{{relationship}}',
              is_next_of_kin: '=> getNokResponse(nextOfKin)',
              note: '{{notes}}'
            }
          ]
        }
      }
    }
  }
};
