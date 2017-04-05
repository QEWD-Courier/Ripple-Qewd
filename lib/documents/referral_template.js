
/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-17 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Will Weatherill                                                  |
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

  10 March 2017

*/

var outputTemplate = {
  sourceId:                         '{{referral._uid}}',
  composerName:                     '{{referral["composer|name"]}}', 
  documentDate:                     '=> getTime(referral.context.start_time)',
  facility:                         '{{referral.context["_health_care_facility|name"]}}',
  referralType:                     '{{referral.referral_details.referral_status.referral_type}}',
  referralDateTime:                 '=> getTime(referral.referral_details.referral_status.time)',
  referralComments:                 '{{referral.referral_details.referral_status.referral_type}}',
  referralReferenceNumber:          '{{referral.referral_details.service_request.referral_control_number}}',
  referredFrom:                     '{{referral.referral_details.service_request.referring_provider.name_of_organisation}}',
  referredTo:                       '{{referral.referral_details.service_request.referred_to_provider.name_of_organisation}}',
  providerContact_organisationName: '{{referral.referral_details.service_request.distribution.individual_recipient.gp.name_of_organisation}}',
  providerContact_workNumber:       '{{referral.referral_details.service_request.distribution.individual_recipient.gp.wpn.work_number}}',
  providerContact_id:               '{{referral.referral_details.service_request.distribution.individual_recipient.gp.identifier}}',
  providerContact_emergencyNumber:  '{{referral.referral_details.service_request.distribution.individual_recipient.gp.emr.emergency_number}}',
  priorityOfReferral:               '{{referral.referral_details.service_request.request["priority|value"]}}',
  referralStatus_code:              '{{referral.referral_details.referral_status.ism_transition["current_state|code"]}}',
  referralStatus_value:             '{{referral.referral_details.referral_status.ism_transition["current_state|value"]}}',
  clinicalNarrative:                '{{referral.referral_details.service_request.narrative}}',
  presentIllness:                   '{{referral.history_of_present_illness.story_history.history_of_present_illness}}',
  clinicalSynopsisComments:         '{{referral.comments.clinical_synopsis.comments}}',
  previousHospitalAttendance:       '{{referral.history_of_present_illness.hospital_attendances_summary.previous_attendances}}',
  medication_anticoagulation_use:   '{{referral.medication_and_medical_devices.anticoagulation_use.anticoagulation_use}}',
  tobaccoUse:                       '{{referral.social_context.history_of_tobacco_use.smoking_details[0].history_of_tobacco_use}}',
  alcoholUse:                       '{{referral.social_context.history_of_alcohol_use.history_of_alcohol_use}}',
  physicalImparement:               '{{referral.social_context.physical_mobility_impairment.physical_mobility_impairment}}',
  systolicBP:                       '{{referral.examination_findings.vital_signs.blood_pressure["systolic|magnitude"]}}',
  systolicBP_units:                 '{{referral.examination_findings.vital_signs.blood_pressure["systolic|units"]}}',
  diastolicBP:                      '{{referral.examination_findings.vital_signs.blood_pressure["diastolic|magnitude"]}}',
  diastolicBP_units:                '{{referral.examination_findings.vital_signs.blood_pressure["diastolic|units"]}}',
  pulse:                            '{{referral.examination_findings.vital_signs.pulse_heart_beat["pulse_rate|magnitude"]}}',
  pulse_units:                      '{{referral.examination_findings.vital_signs.pulse_heart_beat["pulse_rate|units"]}}',
  height:                           '{{referral.examination_findings.height_length.any_event["height_length|magnitude"]}}',
  height_units:                     '{{referral.examination_findings.height_length.any_event["height_length|units"]}}',
  bodyMass:                         '{{referral.examination_findings.body_mass_index.any_event["body_mass_index|magnitude"]}}',
  bodyMass_units:                   '{{referral.examination_findings.body_mass_index.any_event["body_mass_index|units"]}}',
  weight:                           '{{referral.examination_findings.body_weight["weight|magnitude"]}}',
  weight_units:                     '{{referral.examination_findings.body_weight["weight|units"]}}',
  otherExaminationFindings:         '{{referral.examination_findings.physical_examination_findings.description}}',
  
  reasonForReferral: [
    '{{referral.referral_details.service_request.request}}',
    {
      reason: '{{reason_for_referral}}'
    }
  ],

  pastIllensses: [
    '{{referral.history_of_past_illness.problem_diagnosis}}',
    {
      value: '{{history_of_past_illness}}',
      date:  '=> getTime(date_time_clinically_recognised)'
    }
  ],

  surgicalProcedures: [
    '{{referral.history_of_surgical_procedures.procedure}}',
    {
      value: '{{history_of_surgical_procedure}}',
      date:  '=> getTime(time)'
    }
  ],

  allergies: [
    '{{referral.history_of_allergies.adverse_reaction_risk}}',
    {
      cause:       '{{history_of_allergy}}',
      dateCreated: '=> getTime(last_updated)'
    }
  ],

  medications: [
    '{{referral.medication_and_medical_devices.medication_order}}',
    {
      sourceId:       '{{_uid}}',
      name:           '{{order.medication_item}}',
      doseAmount:     '{{narrative}}',
      doseDirections: '{{order.dose_directions_description}}',
      doseTiming:     '{{order.timing}}',
      startDate:      '=> getTime(order.course_details.order_start_date_time)',
      startTime:      '=> getTime(order.course_details.order_start_date_time)'
    }
  ]

};

module.exports = outputTemplate;
