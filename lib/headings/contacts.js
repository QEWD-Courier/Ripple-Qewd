/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
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

20 December 2016

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'contacts',
  textFieldName: 'name',
  headingTableFields: ['name', 'relationship', 'nextOfKin'],
  fieldMap: {
    name: 'name',
    relationship: 'relationshipRoleType',
    relationshipType: 'relationshipCategory',
    relationshipCode: 'relationshipCategoryCode',
      relationshipTerminology: 'relationshipCategoryTerminology',
    contactInformation: 'contactInformation',
    nextOfKin: 'next_of_kin',
    notes: 'notes',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.dateCreated, host);
    }
  },
  post: {
    templateId: 'IDCR - Relevant contacts.v0',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',
        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        field: 'healthcareFacilityId',
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        field: 'healthcareFacilityName',
        default: 'Rippleburgh GP Practice'
      },
      'ctx/id_namespace': {
        default: 'NHS-UK'
      },
      'ctx/id_scheme': {
        default: '2.16.840.1.113883.2.1.4.3'
      },
      'ctx/language': {
        default: 'en'
      },
      'ctx/territory': {
        default: 'GB'
      },
      'ctx/time': {
        field: 'dateTimeRecorded',
        default: function(data) {
          return dateTime.format(new Date());
        }
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/individual_person/person_name/unstructured_name': {
        field: 'name'
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/individual_person/contact_details:0/comms_description': {
        field: 'contactInformation'
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category|code': {
        field: 'relationshipCode'
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_role': {
        field: 'relationship',
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/is_next_of_kin': {
        field: 'nextOfKin'
      },
      'relevant_contacts_list/relevant_contacts/relevant_contact:0/note': {
        field: 'notes'
      }
    }
  }
};
