SELECT
  ehr.entry.composition_id as uid,
  ehr.event_context.start_time as date_submitted,
  ehr.party_identified.name as author,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,value
  }' as procedure_name,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,definingCode,terminologyId,value
  }' as procedure_terminology,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,definingCode,codeString
  }' as procedure_code,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0049 and name/value=''Procedure notes''],/value,value
  }' as procedure_notes,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/time,/value,value
  }' as procedure_datetime,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''],
    /content[openEHR-EHR-SECTION.procedures_rcp.v1],0,
    /items[openEHR-EHR-ACTION.procedure.v1],0,/ism_transition/current_state,/value,value
  }' as procedure_status,
  ehr.event_context.start_time
 FROM ehr.entry
 INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id
 INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id
 INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id
 WHERE (ehr.composition.ehr_id = '{{ehrId}}')
 AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.care_summary.v0');
