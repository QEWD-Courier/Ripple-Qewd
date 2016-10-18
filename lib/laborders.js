var dateTime = require('./dateTime');

module.exports = {
  name: 'laborders',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_created, " +
        "ehr.party_identified.name as author, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''], " +
          "/content[openEHR-EHR-INSTRUCTION.request-lab_test.v1],0, " +
          "/activities[at0001 and name/value=''Lab Request''], /description[at0009], /items[at0121 and name/value=''Service requested''],/value,value" +
        "}' as name, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''], " +
          "/content[openEHR-EHR-ACTION.laboratory_test.v1],0, /time,/value,value" +
        "}' as order_date " +
      "FROM ehr.entry " +
        "INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id " +
        "INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id " +
        "INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.referral.v0');"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created," +
        "a_a/activities[at0001]/description/items[at0121]/value/value as name, " +
        "a_a/activities[at0001]/description/items[at0121]/value/defining_code/code_string as code, " +
        "a_a/activities[at0001]/description/items[at0121]/value/defining_code/terminology_id/value as terminology, " +
        "a_a/activities[at0001]/timing/value as order_date " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.referral.v0] " +
        "contains INSTRUCTION a_a[openEHR-EHR-INSTRUCTION.request-lab_test.v1] " +
        "where a/name/value='Laboratory order' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'name',
  domainTableFields: ['name', 'orderDate'],
  fieldMap: {
    name: 'name',
    code: 'code',
    terminology: 'terminology',
    orderDate: function(data, host) {
      return dateTime.getRippleTime(data.order_date, host);
    },
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - Laboratory Order.v0',
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
        default: 'Northumbria Community NHS'
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
      'laboratory_order/laboratory_test_tracker/ism_transition/careflow_step|code': {
        default: 'at0003'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/careflow_step|value': {
        default: 'Test Requested'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/current_state|code': {
        default: '526'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/current_state|value': {
        default: 'planned'
      },
      'laboratory_order/laboratory_test_tracker/time': {
        //field: 'orderDate'
        field: 'dateCreated'
      },
      'laboratory_order/laboratory_test_request/lab_request/timing': {
        //field: 'orderDate'
        field: 'dateCreated'
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|code': {
        field: 'code'
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|value': {
        field: 'name'
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|terminology': {
        default: 'SNOMED-CT'
      },
      'laboratory_order/laboratory_test_tracker/test_name|terminology': {
        default: 'SNOMED-CT'
      },
      'laboratory_order/laboratory_test_tracker/test_name|code': {
        field: 'code'
      },
      'laboratory_order/laboratory_test_tracker/test_name|value': {
        field: 'name'
      },
      'laboratory_order/laboratory_test_request/narrative': {
        field: 'name'
      }
    }
  }
};

