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

function canHandle(healthlinkDocument) {
  var isDocument = false;

  isDocument = typeof healthlinkDocument['REF_I12']['RF1'] !== 'undefined';

  return isDocument;
}

function toOpenEhr(document) {

  var result = {};

  result['ctx/language'] = "en";
  result['ctx/territory'] = "GB";
  result['ctx/id_namespace'] = "iEHR";
  result['ctx/id_scheme'] = "iEHR";
  result['ctx/time'] = document['REF_I12']['MSH']['MSH.7']["TS.1"];
  result['ctx/composer_name'] = document['REF_I12']['MSH']["MSH.4"]["HD.1"];
  result['ctx/health_care_facility|id'] = document['REF_I12']['MSH']['MSH.4']["HD.2"];

  result['referral/referral_details/service_request/referred_to_provider/identifier'] = document['REF_I12']['MSH']['MSH.6']["HD.1"];
  result['referral/referral_details/service_request/referral_control_number'] = document['REF_I12']['MSH']['MSH.10'];
  result['referral/referral_details/service_request/request:0/timing'] = "Boilerplate timing string";

  addReferralStatus(document['REF_I12']['RF1']['RF1.1']['CE.1'], result);

  result['referral/referral_details/referral_status/referral_type'] = document['REF_I12']['RF1']['RF1.3']['CE.1'];
  result['referral/referral_details/service_request/request:0/referral_type'] = document['REF_I12']['RF1']['RF1.3']['CE.1'];
  result['referral/referral_details/service_request/narrative'] = document['REF_I12']['RF1']['RF1.3']['CE.1'];

  addReferralPriority(document['REF_I12']['RF1']['RF1.3']['CE.2'], result);

  result['referral/referral_details/service_request/referring_provider/identifier'] = document['REF_I12']['RF1']['RF1.6']['EI.1'];
  result['referral/referral_details/referral_status/time'] = document['REF_I12']['RF1']['RF1.7']['TS.1'];
  result['ctx/health_care_facility|name'] = document['REF_I12']['REF_I12.PROVIDER_CONTACT'][0]['PRD']['PRD.4']['PL.1'];
  result['referral/referral_details/service_request/distribution:0/individual_recipient:0/gp/name_of_organisation'] = document['REF_I12']['REF_I12.PROVIDER_CONTACT'][0]['PRD']['PRD.4']['PL.1'];
  result['referral/referral_details/service_request/referring_provider/name_of_organisation'] = document['REF_I12']['REF_I12.PROVIDER_CONTACT'][0]['PRD']['PRD.4']['PL.1'];
  //result['referral/referral_details/service_request/referring_provider/identifier']  = data['REF_I12']['REF_I12.PROVIDER_CONTACT'][0]['PRD']['PRD.7']['PI.1'];
  result['referral/referral_details/service_request/referred_to_provider/name_of_organisation'] = document['REF_I12']['REF_I12.PROVIDER_CONTACT'][0]['PRD']['PRD.3']['XAD.2'];

  addContactDetails(document['REF_I12']['REF_I12.PROVIDER_CONTACT'], result);

  addObservations(document['REF_I12']['REF_I12.OBSERVATION'], result);

  return result;
}

function addObservations(observations, results) {
  var resultTypeCount;
  var resultNotes;
  var resultNote;
  var result;
  var resultType;

  for (var observation in observations) {
    resultTypeCount = {};

    resultNotes = observations[observation]['REF_I12.RESULTS_NOTES'];

    // result notes are optional
    if (resultNotes !== undefined) {
      if (Array.isArray(resultNotes)) {
        for (resultNote in resultNotes) {
          result = resultNotes[resultNote]
          resultType = result['OBX']['OBX.3']['CE.2'].toLowerCase();

          // keep track of the result types
          resultTypeCount[resultType] = (resultTypeCount[resultType] + 1) || 0;

          addResult(resultType, result, resultTypeCount[resultType], results);
        }
      }
      else {
        resultType = resultNotes['OBX']['OBX.3']['CE.2'].toLowerCase();
        addResult(resultType, resultNotes, 0, results);
      }
    }
  }
}

function addResult(resultType, result, resultIndex, results) {
  var resultNoteMap = {
    'reason for referral': {
      addObservation: function (value, units, time, index) {
        results['referral/referral_details/service_request/request:' + index + '/reason_for_referral'] = value;
      }
    },

    'previous hospital attendance': {
      addObservation: function (value, units, time, index) {
        results['referral/history_of_present_illness/hospital_attendances_summary/previous_attendances'] = ("Yes" === value)
      }
    },

    'history of present illness': {
      addObservation: function (value, units, time, index) {
        results['referral/history_of_present_illness/story_history/history_of_present_illness'] = value;
      }
    },

    'history of surgical procedures': {
      addObservation: function (value, units, time, index) {
        if ('NIL' === value) {
          results['referral/history_of_surgical_procedures/exclusion_of_a_procedure/exclusion_statement'] = 'No significant procedures';
          results['referral/history_of_surgical_procedures/exclusion_of_a_procedure/date_last_updated'] = time;
        }
        else {
          results['referral/history_of_surgical_procedures/procedure:' + index + '/ism_transition/current_state|code'] = '532';
          results['referral/history_of_surgical_procedures/procedure:' + index + '/ism_transition/current_state|value'] = 'completed';
          results['referral/history_of_surgical_procedures/procedure:' + index + '/history_of_surgical_procedure'] = value;
          results['referral/history_of_surgical_procedures/procedure:' + index + '/time'] = time;
        }
      }
    },

    'history of allergies': {
      addObservation: function (value, units, time, index) {
        if ('NIL' === value) {
          results['referral/history_of_allergies/exclusion_of_an_adverse_reaction/exclusion_statement'] = 'No known allergies or adverse reactions';
          results['referral/history_of_allergies/exclusion_of_an_adverse_reaction/date_last_updated'] = time;
        }
        else {
          results['referral/history_of_allergies/adverse_reaction_risk:' + index + '/history_of_allergy'] = value;
          results['referral/history_of_allergies/adverse_reaction_risk:' + index + '/history_of_allergy'] = time;
        }
      }
    },

    'history of family member diseases': {
      addObservation: function (value, units, time, index) {
        if ('NIL' === value) {
          results['referral/history_of_family_member_diseases/exclusion_of_family_history/exclusion_statement'] = 'No significant family history';
          results['referral/history_of_family_member_diseases/exclusion_of_family_history/date_last_updated'] = time;
        }
        else {
          results['referral/history_of_family_member_diseases/family_history:' + index + '/history_of_family_member_disease'] = value;
          results['referral/history_of_family_member_diseases/family_history:' + index + '/last_updated'] = time;
        }
      }
    },

    'history of past illness': {
      addObservation: function (value, units, time, index) {
        if ('NIL' === value) {
          results['referral/history_of_past_illness/exclusion_of_a_problem_diagnosis/exclusion_statement'] = 'No significant past history';
          results['referral/history_of_past_illness/exclusion_of_a_problem_diagnosis/last_updated'] = time;
        }
        else {
          results['referral/history_of_past_illness/problem_diagnosis:' + index + '/history_of_past_illness'] = value;
          results['referral/history_of_past_illness/problem_diagnosis:' + index + '/date_time_clinically_recognised'] = time;
        }
      }
    },

    'commnets': {
      addObservation: function (value, units, time, index) {
        results['referral/comments/clinical_synopsis/comments'] = value;
      }
    },

    'interpreter required': {
      addObservation: function (value, units, time, index) {
        results['referral/referral_details/service_request/request:0/interpreter_details/interpreter_required'] = ("Yes" === value)
      }
    },

    'physical mobility impairment': {
      addObservation: function (value, units, time, index) {
        results['referral/social_context/physical_mobility_impairment/physical_mobility_impairment'] = value
      }
    },

    'history of tobacco use': {
      addObservation: function (value, units, time, index) {
        results['referral/social_context/history_of_tobacco_use/smoking_details:0/history_of_tobacco_use'] = value;
      }
    },

    'history of alcohol use': {
      addObservation: function (value, units, time, index) {
        results['referral/social_context/history_of_alcohol_use/history_of_alcohol_use'] = value;
      }
    },

    'pulse': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/vital_signs/pulse_heart_beat/pulse_rate|magnitude'] = value;
        results['referral/examination_findings/vital_signs/pulse_heart_beat/pulse_rate|unit'] = '/min';
      }
    },

    'systolic blood pressure': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/vital_signs/blood_pressure/systolic|magnitude'] = value;
        results['referral/examination_findings/vital_signs/blood_pressure/systolic|unit'] = 'mm[Hg]';
      }
    },

    'diastolic blood pressure': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/vital_signs/blood_pressure/diastolic|magnitude'] = value;
        results['referral/examination_findings/vital_signs/blood_pressure/diastolic|unit'] = 'mm[Hg]';
      }
    },

    'body height': {
      addObservation: function (value, units, time, index) {
        // convert to centimeters
        if ('meters' === units) {
          units = Number(value) * 100;
        }

        results['referral/examination_findings/height_length/any_event:0/height_length|magnitude'] = value;
        results['referral/examination_findings/height_length/any_event:0/height_length|unit'] = 'cm';
      }
    },

    'weight': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/body_weight/weight|magnitude'] = value;
        results['referral/examination_findings/body_weight/weight|unit'] = 'kg';
      }
    },

    'body mass index': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/body_mass_index/any_event:0/body_mass_index|magnitude'] = value;
        results['referral/examination_findings/body_mass_index/any_event:0/body_mass_index|unit'] = 'kg/m2';
      }
    },

    'physical exam.total': {
      addObservation: function (value, units, time, index) {
        results['referral/examination_findings/physical_examination_findings/description'] = value;
      }
    },

    'anticoagulant use': {
      addObservation: function (value, units, time, index) {
        results['referral/medication_and_medical_devices/anticoagulation_use/anticoagulation_use'] = ("Yes" === value);
      }
    },

    'current medication': {
      addObservation: function (value, units, time, index) {
        if ('NIL' === value) {
          results['referral/medication_and_medical_devices/exclusion_of_a_medication/exclusion_statement'] = 'No current medication';
          results['referral/medication_and_medical_devices/exclusion_of_a_medication/date_last_updated'] = time;
        }
        else {
          results['referral/medication_and_medical_devices/medication_order:' + index + '/order/medication_item'] = value;
          results['referral/medication_and_medical_devices/medication_order:' + index + '/narrative'] = value;
          results['referral/medication_and_medical_devices/medication_order:' + index + '/order/timing'] = 'Boilerplate timing';
          results['referral/medication_and_medical_devices/medication_order:' + index + '/order/course_details/order_start_date_time'] = time;
        }
      }
    }
  };

  var mapping = resultNoteMap[resultType];
  if (mapping !== undefined) {
    mapping.addObservation(result['OBX']['OBX.5'], result['OBX']['OBX.6']['CE.1'], result['OBX']['OBX.14']['TS.1'], resultIndex);
  }
}

function addContactDetails(contactDetails, result) {
  var contactDetailsTypeMap = {
    'WPN': 'referral/referral_details/service_request/distribution/individual_recipient/gp/wpn/work_number',
    'EMR': 'referral/referral_details/service_request/distribution/individual_recipient/gp/emr/emergency_number',
    'NET': 'referral/referral_details/service_request/distribution/individual_recipient/gp/net/internet'
  };

  var xtn2;
  var contactDetailType;

  for (var contactDetail in contactDetails) {
    xtn2 = contactDetails[contactDetail]['PRD']['PRD.5']['XTN.2']
    if (xtn2 !== undefined) {
      contactDetailType = contactDetailsTypeMap[xtn2];
      if (contactDetailType !== undefined) {
        result[contactDetailType] = contactDetails[contactDetail]['PRD']['PRD.5']['XTN.1'];
      }
    }
  }
}

function addReferralPriority(referralPriority, result) {
  var referralPriorities = {
    "U": "at0136",
    "E": "at0137",
    "R": "at0138",
  }

  result['referral/referral_details/service_request/request:0/priority|code'] = referralPriorities[referralPriority];
  result['referral/referral_details/service_request/request:0/comments'] = referralPriority;
}

function addReferralStatus(referralStatus, result) {
  var referralStatusMaps = {
    "P": {
      stateCode: '526',
      stateValue: 'planned',
      careflowCode: 'at0002',
      careflowValue: 'Referral planned'
    },
    "A": {
      stateCode: '529',
      stateValue: 'scheduled',
      careflowCode: 'at0003',
      careflowValue: 'Appoinment scheduled'
    },
    "R": {
      stateCode: '528',
      stateValue: 'cancelled',
      careflowCode: 'at009',
      careflowValue: 'Referral cancelled'
    },
    "E": {
      stateCode: '531',
      stateValue: 'aborted',
      careflowCode: 'at023',
      careflowValue: 'Referral expired'
    }
  };

  var referralStatusMap = referralStatusMaps[referralStatus];

  result['referral/referral_details/referral_status/ism_transition/current_state|code'] = referralStatusMap.stateCode;
  result['referral/referral_details/referral_status/ism_transition/current_state|value'] = referralStatusMap.stateValue;
  result['referral/referral_details/referral_status/ism_transition/careflow_step|code'] = referralStatusMap.careflowCode;
  result['referral/referral_details/referral_status/ism_transition/careflow_step|value'] = referralStatusMap.careflowValue;

}

module.exports = {
  toOpenEhr: toOpenEhr,
  canHandle: canHandle
};
