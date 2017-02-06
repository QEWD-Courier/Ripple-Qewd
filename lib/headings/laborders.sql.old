SELECT
  ehr.entry.composition_id as uid,
  ehr.event_context.start_time as date_created,
  ehr.party_identified.name as author,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''],
    /content[openEHR-EHR-INSTRUCTION.request-lab_test.v1],0,
    /activities[at0001 and name/value=''Lab Request''], /description[at0009], /items[at0121 and name/value=''Service requested''],/value,value
  }' as name,
  ehr.entry.entry #>> '{
    /composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''],
    /content[openEHR-EHR-ACTION.laboratory_test.v1],0, /time,/value,value
  }' as order_date
 FROM ehr.entry
 INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id
 INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id
 INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id
 WHERE (ehr.composition.ehr_id = '{{ehrId}}')
 AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.referral.v0');
