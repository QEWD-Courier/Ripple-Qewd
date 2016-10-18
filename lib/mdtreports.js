var dateTime = require('./dateTime');

module.exports = {
  name: 'mdtreports',
  query: {
    sql: [],
    aql: [
      /*
      "select " +
        "a/uid/value as uid, " +
        "a/context/start_time/value as date_created," +
        "b_a/items/protocol/items[at0011]/value/value as service_team, " +
        "b_a/items/activities[at0001]/timing/value as meeting_date, " +
        "b_b/items/data[at0001]/items[at0004]/value/value as question, " +
        "b_c/items/data[at0001]/items[at0002]/value/value as notes " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.report.v1] " +
      "contains ( " +
        "SECTION b_a[openEHR-EHR-SECTION.referral_details_rcp.v1] and " +
        "SECTION b_b[openEHR-EHR-SECTION.history_rcp.v1] and " +
        "SECTION b_c[openEHR-EHR-SECTION.plan_requested_actions_rcp.v1]) " +
      "where a/name/value='MDT Output Report' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,
      */

      "select " +
        "a/uid/value as uid, " +
        "a/context/start_time/value as date_created, " +
        "b_d/activities[at0001]/timing/value as meeting_date, " +
        "b_d/protocol[at0008]/items[at0011]/value/value as service_team, " +
        "b_f/data[at0001]/items[at0002]/value/value as notes, " +
        "b_g/data[at0001]/items[at0004]/value/value as question " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.report.v1] " +
      "contains ( " +
        "INSTRUCTION b_d[openEHR-EHR-INSTRUCTION.request-referral.v1] or " +
        "EVALUATION b_f[openEHR-EHR-EVALUATION.recommendation.v1] or " +
        "EVALUATION b_g[openEHR-EHR-EVALUATION.reason_for_encounter.v1]) " +
      "where " +
        "a/name/value='MDT Output Report' and ( " +
        "e/ehr_status/subject/external_ref/namespace='uk.nhs.nhs_number' and " +
        "e/ehr_status/subject/external_ref/id/value='"
      ,

      'nhsNo',

      //"'"
      "')"
    ]
  },
  textFieldName: 'name',
  domainTableFields: ['serviceTeam', 'dateOfRequest', 'dateOfMeeting'],
  fieldMap: {
    serviceTeam: 'service_team',
    dateOfRequest: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    },
    dateOfMeeting: function(data, host) {
      return dateTime.getRippleTime(data.meeting_date, host);
    },
    timeOfMeeting: function(data, host) {
      return dateTime.msSinceMidnight(data.meeting_date, host);
    },
    servicePageLink: function() {
      return null;
    },
    question: 'question',
    notes: 'notes'
  }
};
