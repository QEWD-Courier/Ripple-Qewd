var dateTime = require('./dateTime');

function getTestResults(record) {
  console.log('******!!!! record = ' + JSON.stringify(record));

  if (!record.test_panel) {
    // ethercis record
    var nrange = '';
    if (record.normal_range_lower && record.normal_range_upper) {
      nrange = record.normal_range_lower + ' - ' + record.normal_range_upper;
    }
    var results = [
      {
        result: record.result_name || '',
        value:  record.result_value || '',
        unit:   record.result_unit || '',
        normalRange: nrange,
        comment: record.result_comment || ''
      }
    ];
    return results;
  }

  // marand / AQL result

  var tests = record.test_panel.items;
  var results = [];
  var test;
  for (var index in tests) {
    test = tests[index];
    var item = test.items[0];
    var nrange = item.value.normal_range;
    var range = null;
    if (nrange) range = nrange.lower.magnitude + ' - ' + nrange.upper.magnitude;
    var comment = '';
    var commentItem = test.items[1];
    if (commentItem && commentItem.name.value === 'Comment') {
      comment = commentItem.value.value;
    }
    
    var result = {
      result: item.name.value,
      value: item.value.magnitude,
      unit: item.value.units,
      normalRange: range,
      comment: comment
    };
    results.push(result);

  }
  return results;
  /*
  return  [{
        "result": "Urea xxxxx",
        "value": "7.6",
        "unit": "mmol/l",
        "normalRange": null,
        "comment": "may be technical artefact"
  }];
  */
}

module.exports = {
  name: 'labresults',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_created, " +
        "ehr.party_identified.name as author, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /time,/value,value" +
            "}' as sample_taken, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0005 and name/value=''Test name''],/value,value" +
            "}' as test_name, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0057 and name/value=''Conclusion''],/value,value" +
            "}' as conclusion, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0073 and name/value=''Test status''],/value,value" +
            "}' as status, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0001],0,/value,/name" +
            "}' as result_name, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0001],0,/value,/value,magnitude" +
            "}' as result_value, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0001],0,/value,/value,units" +
            "}' as result_unit, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0001],0,/value,/value,normalRange,interval,lower,magnitude" +
            "}' as normal_range_lower, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0001],0,/value,/value,normalRange,interval,upper,magnitude" +
            "}' as normal_range_upper, " +
            "ehr.entry.entry #>> " +
            "'{" +
                "/composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''], " +
                "/content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0, " +
                "/data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''], " +
                "/items[at0002],0,/items[at0003],0,/value,/value,value" +
            "}' as result_comment " +
      "FROM ehr.entry " +
        "INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id " +
        "INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id " +
        "INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.report-result.v1');"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created," +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0005]/value/value as test_name, " +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0057]/value/value as conclusion, " +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0073]/value/value as status, " +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0075]/value/value as sample_taken, " +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0] as test_panel " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.report-result.v1] " +
        "contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.laboratory_test.v0] " +
        "where a/name/value='Laboratory test report' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'test_name',
  domainTableFields: ['testName', 'sampleTaken', 'dateCreated'],
  fieldMap: {
    testName: 'test_name',
    sampleTaken: function(data, host) {
      return dateTime.getRippleTime(data.sample_taken, host);
    },
    status: 'status',
    conclusion: 'conclusion',
    testResults: getTestResults,
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
