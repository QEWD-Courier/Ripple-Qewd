SELECT
  ehr.entry.composition_id as uid,
  ehr.event_context.start_time as date_created,
  ehr.party_identified.name as author,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /time,/value,value
  }' as sample_taken,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0005 and name/value=''Test name''],/value,value
  }' as test_name,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0057 and name/value=''Conclusion''],/value,value
  }' as conclusion,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[at0073 and name/value=''Test status''],/value,value
  }' as status,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0001],0,/value,/name
  }' as result_name,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0001],0,/value,/value,magnitude
  }' as result_value,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0001],0,/value,/value,units
  }' as result_unit,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0001],0,/value,/value,normalRange,interval,lower,magnitude
  }' as normal_range_lower,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0001],0,/value,/value,normalRange,interval,upper,magnitude
  }' as normal_range_upper,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.report-result.v1 and name/value=''Laboratory test report''],
    /content[openEHR-EHR-OBSERVATION.laboratory_test.v0],0,
    /data[at0001],/events,/events[at0002],0, /data[at0003],/items[openEHR-EHR-CLUSTER.laboratory_test_panel.v0 and name/value=''Laboratory test panel''],
    /items[at0002],0,/items[at0003],0,/value,/value,value
  }' as result_comment
 FROM ehr.entry
 INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id
 INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id
 INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id
 WHERE (ehr.composition.ehr_id = '{{ehrId}}')
 AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.report-result.v1');
