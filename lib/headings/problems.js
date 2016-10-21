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
  name: 'problems',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_created, " +
        "ehr.party_identified.name as author, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], " +
          "/content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, " +
          "/items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,value" +
        "}' as problem, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], " +
          "/content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0, " +
          "/data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,definingCode,codeString" +
        "}' as problem_code, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], " +
          "/content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0, " +
          "/data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,definingCode,terminologyId,value" +
        "}' as problem_terminology, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], " +
          "/content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, " +
          "/items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0077 and name/value=''Date/time of onset''],/value,value" +
        "}' as onset_date, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], " +
          "/content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, " +
          "/items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0009 and name/value=''Clinical description''],/value,value" +
        "}' as description " +
      "FROM ehr.entry " +
      "INNER JOIN ehr.composition ON ehr.composition.id = ehr.entry.composition_id " +
      "INNER JOIN ehr.party_identified ON ehr.composition.composer = ehr.party_identified.id " +
      "INNER JOIN ehr.event_context ON ehr.event_context.composition_id = ehr.entry.composition_id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.problem_list.v1');"
    ]
  },
  textFieldName: 'problem',
  headingTableFields: ['problem', 'dateofOnset'],
  fieldMap: {
    problem: 'problem',
    dateOfOnset: function(data, host) {
      return dateTime.getRippleTime(data.onset_date, host);
    },
    description: 'description',
    terminology: 'problem_terminology',
    code: 'problem_code',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR Problem List.v1',
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
          return new Date().toISOString()
        }
      },
      'problem_list/problems_and_issues/problem_diagnosis:0/problem_diagnosis_name|value': {
        field: 'problem'
      },
      'problem_list/problems_and_issues/problem_diagnosis:0/clinical_description': {
        field: 'description'
      },
      'problem_list/problems_and_issues/problem_diagnosis:0/problem_diagnosis_name|code': {
        field: 'code',
        default: '00001'
      },
      'problem_list/problems_and_issues/problem_diagnosis:0/problem_diagnosis_name|terminology': {
        field: 'terminology',
        default: 'SNOMED-CT'
      },
      'problem_list/problems_and_issues/problem_diagnosis:0/date_time_of_onset': {
        field: 'dateOfOnset'
      }
    }
  }

};

