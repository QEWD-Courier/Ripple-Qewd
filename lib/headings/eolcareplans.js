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
 | Author: Will Weatherhill                                                 |
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

13 February 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'eolcareplans',
  textFieldName: 'name',
  headingTableFields: ['name', 'type', 'dateCreated'],
  fieldMap: {
    name: function(record) {
      return 'End of Life Care';
    },
    type: function(record) {
      return 'Document';
    },
    careDocument: function(record, host) {
      return {
        name: 'End of Life Care',
        type: 'Document',
        author: record.author,
        dateCreated: dateTime.getRippleTime(record.date_created, host)
      };
    },
    cprDecision: function(record, host) {
      return {
        cprDecision: record.cpr_decision,
        dateOfDecision: dateTime.getRippleTime(record.cpr_date_of_decision, host),
        comment: record.cpr_comment
      };
    },
    prioritiesOfCare: function(record) {
      return {
        placeOfCare: record.priority_place_of_care,
        placeOfDeath: record.priority_place_of_death,
        comment: record.priority_comment
      };
    },
    treatmentDecision: function(record, host) {
      return {
        decisionToRefuseTreatment: record.treatment_decision,
        dateOfDecision: dateTime.getRippleTime(record.treatment_date_of_decision, host),
        comment: record.treatment_comment
      };
    },
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - End of Life Patient Preferences.v0',
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
      'end_of_life_patient_preferences/legal_information:0/preferred_priorities_of_care:0/preferred_place_of_care:0|value' : {
          default: function(data) {
          return data.prioritiesOfCare.placeOfCare;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/preferred_priorities_of_care:0/preferred_place_of_care:0|code' : {
          default: 'at0008'
      },
      'end_of_life_patient_preferences/legal_information:0/preferred_priorities_of_care:0/preferred_place_of_death:0|value' : {
          default: function(data) {
          return data.prioritiesOfCare.placeOfDeath;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/preferred_priorities_of_care:0/preferred_place_of_death:0|code' : {
          default: 'at0018'
      },
      'end_of_life_patient_preferences/legal_information:0/preferred_priorities_of_care:0/comment' : {
          default: function(data) {
          return data.prioritiesOfCare.comment;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/advance_decision_to_refuse_treatment/decision_status|value' : {
          default: function(data) {
          return data.treatmentDecision.decisionToRefuseTreatment;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/advance_decision_to_refuse_treatment/decision_status|code' : {
          default: 'at0005'
      },
      'end_of_life_patient_preferences/legal_information:0/advance_decision_to_refuse_treatment/date_of_decision' : {
          default: function(data) {
          var startDate = new Date(data.treatmentDecision.dateOfDecision).getTime();
          return dateTime.format(startDate);
        }
      },
      'end_of_life_patient_preferences/legal_information:0/advance_decision_to_refuse_treatment/comment' : {
          default: function(data) {
          return data.treatmentDecision.comment;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/cpr_decision/cpr_decision|value' : {
        default: function(data) {
          return data.cprDecision.cprDecision;
        }
      },
      'end_of_life_patient_preferences/legal_information:0/cpr_decision/cpr_decision|code' : {
        default: 'at0005'
      },
      'end_of_life_patient_preferences/legal_information:0/cpr_decision/date_of_cpr_decision' : {
        default: function(data) {
          var startDate = new Date(data.cprDecision.dateOfDecision).getTime();
          return dateTime.format(startDate);
        }
      },
      'end_of_life_patient_preferences/legal_information:0/cpr_decision/comment' : {
        default: function(data) {
         return data.cprDecision.comment;
        }
      },
    }
  }
};
