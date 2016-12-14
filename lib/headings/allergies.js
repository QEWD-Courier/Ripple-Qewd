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

var dateTime = require('../dateTime')

var heading = {
  name: 'allergies',
  textFieldName: 'cause',
  headingTableFields: ['cause', 'reaction'],
  fieldMap: {
    cause: 'cause',
    causeCode: 'cause_code',
    causeTerminology: 'cause_terminology',
    terminologyCode: 'reaction_code',
    reaction: 'reaction',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - Adverse Reaction List.v1',
    destination: 'marand',
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
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|value': {
        field: 'cause'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|code': {
        field: 'causeCode'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|terminology': {
        field: 'causeTerminology'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/reaction_details/manifestation:0': {
        field: 'reaction'
      }
    }
  }
};

module.exports = heading;
