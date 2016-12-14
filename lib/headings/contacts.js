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

18 October 2016

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
      return dateTime.getRippleTime(data.date_created, host);
    }
  }

 /* Sample INPUT JSON "relevant_contacts_list/relevant_contacts/relevant_contact:0/individual_person/person_name/unstructured_name": "Unstructured name 14",
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/individual_person/address/address_description": "Address description 16",
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/individual_person/contact_details:0/comms_description": "Comms description 59",
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category|code": "at0037",
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_role": "Relationship/ role 22",
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/is_next_of_kin": true,
  "relevant_contacts_list/relevant_contacts/relevant_contact:0/note": "Note 59"*/
};
