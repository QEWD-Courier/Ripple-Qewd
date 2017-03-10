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

function getDocumentType() {
  return 'Referral';
}

function canHandle(openEhrDocument) {
  var isDocument = false;

  const properties = Object.keys(openEhrDocument);
  for (var p = 0; (p < properties.length && isDocument === false); p++) {
    const property = properties[p];

    isDocument = property.startsWith('referral');
  }

  return isDocument;
}

var fieldMap = {
  'referral/_uid': {
    field: 'sourceId'
  },
  'referral/context/start_time': {
    field: 'documentDate'
  },
  'referral/composer|name': {
    field: 'composerName'
  },
  'referral/context/_health_care_facility|name': {
    field: 'facility'
  },
  'referral/referral_details/referral_status/referral_type': {
    field: 'referralType'
  },
  'referral/referral_details/referral_status/time': {
    field: 'referralDateTime'
  },
  'referral/referral_details/referral_status/referral_type': {
    field: 'referralComments'
  },
  'referral/referral_details/service_request/referral_control_number': {
    field: 'referralReferenceNumber'
  },
  'referral/referral_details/service_request/referring_provider/name_of_organisation': {
    field: 'referredFrom'
  },
  'referral/referral_details/service_request/referred_to_provider/name_of_organisation': {
    field: 'referredTo'
  },
  'referral/referral_details/service_request/distribution/individual_recipient/gp/name_of_organisation': {
    field: 'providerContact_organisationName'
  },
  'referral/referral_details/service_request/distribution/individual_recipient/gp/wpn/work_number': {
    field: 'providerContact_workNumber'
  },
  'referral/referral_details/service_request/distribution/individual_recipient/gp/identifier': {
    field: 'providerContact_id'
  },
  'referral/referral_details/service_request/distribution/individual_recipient/gp/emr/emergency_number': {
    field: 'providerContact_emergencyNumber'
  },
  'referral/referral_details/service_request/request/priority|value': {
    field: 'priorityOfReferral'
  },
  'referral/referral_details/referral_status/ism_transition/current_state|code': {
    field: 'referralStatus_code'
  },
  'referral/referral_details/referral_status/ism_transition/current_state|value': {
    field: 'referralStatus_value'
  },
  'referral/referral_details/service_request/narrative': {
    field: 'clinicalNarrative'
  },
  'referral/history_of_present_illness/story_history/history_of_present_illness': {
    field: 'presentIllness'
  },
  'referral/comments/clinical_synopsis/comments': {
    field: 'clinicalSynopsisComments'
  },
  'referral/history_of_present_illness/hospital_attendances_summary/previous_attendances': {
    field: 'previousHospitalAttendance'
  },
  'referral/medication_and_medical_devices/anticoagulation_use/anticoagulation_use': {
    field: 'medication_anticoagulation_use'
  },
  'referral/social_context/history_of_tobacco_use/smoking_details:0/history_of_tobacco_use': {
    field: 'tobaccoUse'
  },
  'referral/social_context/history_of_alcohol_use/history_of_alcohol_use': {
    field: 'alcoholUse'
  },
  'referral/social_context/physical_mobility_impairment/physical_mobility_impairment': {
    field: 'physicalImparement'
  },
  'referral/examination_findings/vital_signs/blood_pressure/systolic|magnitude': {
    field: 'systolicBP'
  },
  'referral/examination_findings/vital_signs/blood_pressure/systolic|units': {
    field: 'systolicBP_units'
  },
  'referral/examination_findings/vital_signs/blood_pressure/systolic|magnitude': {
    field: 'diastolicBP'
  },
  'referral/examination_findings/vital_signs/blood_pressure/systolic|units': {
    field: 'diastolicBP_units'
  },
  'referral/examination_findings/vital_signs/pulse_heart_beat/pulse_rate|magnitude': {
    field: 'pulse'
  },
  'referral/examination_findings/vital_signs/pulse_heart_beat/pulse_rate|units': {
    field: 'pulse_units'
  },
  'referral/examination_findings/height_length/any_event/height_length|magnitude': {
    field: 'height'
  },
  'referral/examination_findings/height_length/any_event/height_length|units': {
    field: 'height_units'
  },
  'referral/examination_findings/body_mass_index/any_event/body_mass_index|magnitude': {
    field: 'bodyMass'
  },
  'referral/examination_findings/body_mass_index/any_event/body_mass_index|units': {
    field: 'bodyMass_units'
  },
  'referral/examination_findings/body_weight/weight|magnitude': {
    field: 'weight'
  },
  'referral/examination_findings/body_weight/weight|units': {
    field: 'weight_units'
  },
  'referral/examination_findings/physical_examination_findings/description': {
    field: 'otherExaminationFindings'
  },
  'referral/referral_details/service_request/request': {
    field: 'reasonForReferral',
    fieldMap: {
      'reason_for_referral': {
        field: 'reason'
      }
    }
  },
  'referral/history_of_past_illness/problem_diagnosis': {
    field: 'pastIllensses',
    fieldMap: {
      'history_of_past_illness': {
        field: 'value'
      },
      'date_time_clinically_recognised': {
        field: 'date'
      }
    }
  },
  'referral/history_of_surgical_procedures/procedure': {
    field: 'surgicalProcedures',
    fieldMap: {
      'history_of_surgical_procedure': {
        field: 'value'
      },
      'time': {
        field: 'date'
      }
    }
  },
  'referral/history_of_allergies/adverse_reaction_risk': {
    field: 'allergies',
    fieldMap: {
      'history_of_allergy': {
        field: 'cause'
      },
      'last_updated': {
        field: 'dateCreated'
      }
    }
  },
  'referral/medication_and_medical_devices/medication_order': {
    field: 'medications',
    fieldMap: {
      '_uid': {
        field: 'sourceId'
      },
      'medication_item': {
        field: 'name'
      },
      'narrative': {
        field: 'doseAmount'
      },
      'dose_directions_description': {
        field: 'doseDirections'
      },
      'timing': {
        field: 'doseTiming'
      },
      'order_start_date_time': {
        field: 'startDate'
      },
      'order_start_date_time': {
        field: 'startTime' //-- todo date/time transform function
      }
    }
  }
}

module.exports = {
  fieldMap: fieldMap,
  getDocumentType: getDocumentType,
  canHandle: canHandle
};