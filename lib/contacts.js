var dateTime = require('./dateTime');

module.exports = {
  name: 'contacts',
  query: {
    //sql: [],
    aql: [
      "select " +
      /*
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created," +
        "a_a/items/data[at0001]/items/items[openEHR-EHR-CLUSTER.person_name.v1]/items/value/value as name, " +
        "a_a/items/data[at0001]/items/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items/value/value as contact_information, " +
        "a_a/items/data[at0001]/items[at0035]/value/value as relationship_type, " +
        "a_a/items/data[at0001]/items[at0035]/value/defining_code/terminology_id/value as relationship_terminology, " +
        "a_a/items/data[at0001]/items[at0035]/value/defining_code/code_string as relationship_code, " +
        "a_a/items/data[at0001]/items[at0030]/value/value as relationship, " +
        "a_a/items/data[at0001]/items[at0017]/value/value as notes, " +
        "a_a/items/data[at0001]/items[at0025]/value/value as next_of_kin " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.health_summary.v1] " +
        "contains SECTION a_a[openEHR-EHR-SECTION.relevant_contacts_rcp.v1] " +
        //"where a/name/value='Relevant contacts' " +
        "where a/name/value='Relevant Contacts List' " +
      */


        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/items[at0001]/value/value as name, " +
        "b_b/data[at0001]/items[at0030]/value/value as relationship, " +
        "b_b/data[at0001]/items[at0025]/value/value as next_of_kin, " +
        "b_c/items[at0002]/value/value as contact_information, " +
        "b_b/data[at0001]/items[at0017]/value/value as notes, " +
        "b_b/data[at0001]/items[at0035]/value/value as relationship_type, " +
        "b_b/data[at0001]/items[at0035]/value/defining_code/code_string as relationship_code, " +
        "b_b/data[at0001]/items[at0035]/value/defining_code/terminologyId/value as relationship_terminology " +
      "from EHR e [ehr_id/value = '",

      'ehrId',

      "'] " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.health_summary.v1] " +
        "contains ( " +
          "CLUSTER b_a[openEHR-EHR-CLUSTER.person_name.v1] or " +
          "ADMIN_ENTRY b_b[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1] or " +
          "CLUSTER b_c[openEHR-EHR-CLUSTER.telecom_uk.v1]" +
        ") " +
        "where a/name/value='Relevant Contacts List'"
    ]
  },
  textFieldName: 'name',
  domainTableFields: ['name', 'relationship', 'nextOfKin'],
  fieldMap: {
    name: 'name',
    relationship: 'relationship',
    relationshipType: 'relationship_type',
    relationshipCode: 'relationship_code',
    relationshipTerminology: 'relationship_terminology',
    contactInformation: 'contact_information',
    nextOfKin: 'next_of_kin',
    notes: 'notes',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
