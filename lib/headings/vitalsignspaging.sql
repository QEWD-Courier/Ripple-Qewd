SELECT
  ehr.entry.composition_id as uid,
  ehr.event_context.start_time as date_created,
  ehr.party_identified.name as author,
  ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.respiration.v1],0,/data[at0001],/events,/events[at0002],0,/state[at0022],/items[openEHR-EHR-CLUSTER.ambient_oxygen.v0],0,/items[at0057],0,/value,value}'
   as onAir,
   ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.respiration.v1],0,/data[at0001],/events,/events[at0002],0,/data[at0003],/items[at0004],0,/value,magnitude}'
   as respiratoryRate,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.pulse.v1],0,/data[at0002],/events,/events[at0003],0,/data[at0001],/items[at0004],0,/value,magnitude}'
   as heartRate,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.body_temperature.v1],0,/data[at0002],/events,/events[at0003],0,/data[at0001],/items[at0004],0,/value,magnitude}'
   as temperature,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.avpu.v1],0,/data[at0001],/events,/events[at0002],0,/data[at0003],/items[at0004],0,/value,definingCode,codeString}'
   as levelOfConsciousnessCode,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.blood_pressure.v1],0,/data[at0001],/events,/events[at0006],0,/data[at0003],/items[at0004],0,/value,magnitude}'
   as systolic,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.blood_pressure.v1],0,/data[at0001],/events,/events[at0006],0,/data[at0003],/items[at0005],0,/value,magnitude}'
   as diastolic,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.indirect_oximetry.v1],0,/data[at0001],/events,/events[at0002],0,/data[at0003],/items[at0006],0,/value,numerator}'
   as oxygenSats,
    ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value=''Vital Signs Observations''],/content[openEHR-EHR-SECTION.vital_signs.v1],0,/items[openEHR-EHR-OBSERVATION.news_uk_rcp.v1],0,/data[at0001],/events,/events[at0002],0,/data[at0003],/items[at0028],0,/value,magnitude}'
   as newsScore
   
 FROM ehr.entry
 INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id
 INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id
 INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id
 WHERE (ehr.composition.ehr_id = '{{ehrId}}')
 AND (ehr.entry.template_id = 'IDCR - Vital Signs Encounter.v1') 
 ORDER BY date_created DESC 
 offset {{offset}} rows FETCH NEXT {{fetch}} rows only