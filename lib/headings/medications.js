/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

18 October 2016

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'medications',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_created, " +
        "ehr.party_identified.name as author, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0109 and name/value=''Dose amount description''],/value,value " +
        "}' as dose_amount, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/narrative,/value,value" +
        "}' as narrative, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0091 and name/value=''Route''],/value,value " +
        "}' as route, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0070 and name/value=''Medication item''],/value,value " +
        "}' as name, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0070 and name/value=''Medication item''],/value,definingCode,codeString " +
        "}' as medication_code, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0070 and name/value=''Medication item''],/value,definingCode,terminologyId,value " +
        "}' as medication_terminology, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0113 and name/value=''Course details''],/items[at0012],0,/value,/value,value " +
        "}' as start_date, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0055 and name/value=''Dose timing description''],/value, value " +
        "}' as dose_timing, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], " +
          "/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, " +
          "/items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0044 and name/value=''Additional instruction''],/value, value " +
        "}' as dose_directions " +
      "FROM ehr.entry " +
        "INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id " +
        "INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id " +
        "INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.medication_list.v0');"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created," +
        "a_a/items/items/data[at0001]/items/items[at0001]/value/value as name, " +
        "a_a/items/items/data[at0001]/items/items[at0001]/value/defining_code/code_string as medication_code, " +
        "a_a/items/items/data[at0001]/items/items[at0001]/value/defining_code/terminology_id/value as medication_terminology, " +
        "a_a/items/items/data[at0001]/items/items[at0002]/value/defining_code/code_string as route, " +
        "a_a/items/items/data[at0001]/items/items[at0003]/value/value as dose_directions, " +
        "a_a/items/items/data[at0001]/items/items[at0020]/value/value as dose_amount, " +
        "a_a/items/items/data[at0001]/items/items[at0021]/value/value as dose_timing, " +
        "a_a/items/items/data[at0001]/items/items[at0046]/items/value/value as start_date " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] " +
      "contains SECTION a_a[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1] " +
      "where a/name/value='Current medication list' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'name',
  headingTableFields: ['name', 'doseAmount'],
  fieldMap: {
    name: 'name',
    doseAmount: 'dose_amount',
    doseDirections: 'dose_directions',
    doseTiming: 'dose_timing',
    route: 'route',
    startDate: function(data, host) {
      return dateTime.getRippleTime(data.start_date, host);
    },
    startTime: function(data, host) {
      return dateTime.msSinceMidnight(data.start_date, host);
    },
    medicationCode: 'medication_code',
    medicationTerminology: 'medication_terminology',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
