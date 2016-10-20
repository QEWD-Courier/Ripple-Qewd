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
  name: 'allergies',
  query: {
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/data[at0001]/items[at0002]/value/value as cause, " +
        "b_a/data[at0001]/items[at0002]/value/defining_code/code_string as cause_terminology, " +
        "b_a/data[at0001]/items[at0002]/value/defining_code/terminology_id/value as cause_code, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/value as reaction, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/defining_code/codeString as reaction_code, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/terminology_id/value as reaction_terminology " +
      "from EHR e [ehr_id/value = '",

      'ehrId',

      "'] " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1] " +
      "contains EVALUATION b_a[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1] " +
      "where " +
        "a/name/value='Adverse reaction list'"
    ],
  },
  textFieldName: 'cause',
  headingTableFields: ['cause', 'reaction'],
  fieldMap: {
    cause: 'cause',
    causeCode: 'cause_code',
    causeTerminology: 'cause_terminology',
    terminologyCode: 'cause_code',
    reaction: 'reaction',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - Adverse Reaction List.v1',
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
          return new Date().toISOString();
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
