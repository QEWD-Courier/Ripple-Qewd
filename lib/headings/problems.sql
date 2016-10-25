SELECT
  ehr.entry.composition_id as uid,
  ehr.event_context.start_time as date_created,
  ehr.party_identified.name as author,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''],
    /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0,
    /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,value
  }' as problem,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''],
    /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,
    /data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,definingCode,codeString
  }' as problem_code,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''],
    /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,
    /data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,definingCode,terminologyId,value
  }' as problem_terminology,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''],
    /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0,
    /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0077 and name/value=''Date/time of onset''],/value,value
  }' as onset_date,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''],
    /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0
    /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0009 and name/value=''Clinical description''],/value,value
  }' as description
 FROM ehr.entry
 INNER JOIN ehr.composition ON ehr.composition.id = ehr.entry.composition_id
 INNER JOIN ehr.party_identified ON ehr.composition.composer = ehr.party_identified.id
 INNER JOIN ehr.event_context ON ehr.event_context.composition_id = ehr.entry.composition_id
 WHERE (ehr.composition.ehr_id = '{{ehrId}}')
 AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.problem_list.v1');
