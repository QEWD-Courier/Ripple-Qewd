var dateTime = require('./dateTime');

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
  domainTableFields: ['cause', 'reaction'],
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
