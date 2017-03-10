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

  isDocument = healthlinkDocument['REF_I12']['DG1'] !== undefined;

  return isDocument;
}

function toOpenEhr(document) {
  var result = {};

  result['ctx/language'] = "en";
  result['ctx/territory'] = "GB";
  result['ctx/id_namespace'] = "iEHR";
  result['ctx/id_scheme'] = "iEHR";
  result['ctx/time'] = document['REF_I12']['MSH']['MSH.7']["TS.1"];
  result['ctx/composer_name'] = document['REF_I12']['MSH']["MSH.6"]["HD.1"];
  result['ctx/composer_id'] = document['REF_I12']['MSH']["MSH.6"]["HD.2"];
  result['ctx/health_care_facility|name'] = document['REF_I12']['MSH']['MSH.4']["HD.1"];
  result['ctx/health_care_facility|id'] = document['REF_I12']['MSH']['MSH.4']["HD.2"];

  result['discharge_summary/composer|id_scheme'] = document['REF_I12']['MSH']["MSH.6"]["HD.3"];
  result['discharge_summary/clinical_summary/clinical_synopsis/synopsis'] = document['REF_I12']['NTE']['NTE.3']['_'].trim();

  addDischargeIdentifier(document['REF_I12']['PID']['PID.3'], result);

  addDiagnoses(document['REF_I12']['DG1'], result);

  addProfessionalIdentifier(document['REF_I12']['REF_I12.PATIENT_VISIT']['PV1']['PV1.7'], result);

  return result;
}

function addProfessionalIdentifier(attendingDoctor, result) {
  var identifier = attendingDoctor['XCN.1'];

  if (identifier !== undefined) {
    result['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier'] = identifier;
    result['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|issuer'] = 'iEHR';
    result['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|assigner'] = 'iEHR';
    result['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|type'] = 'MCN';
    result['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_name/name'] = attendingDoctor['XCN.2']['FN.1'];
  }
}

function addDiagnoses(diagnoses, result) {
  var index = 0;

  if (Array.isArray(diagnoses)) {

    for (diagnosis in diagnoses) {
      addDiagnosis(diagnoses[diagnosis], index, result);
      index++;
    }
  }
  else {
    addDiagnosis(diagnoses, index, result);
  }
}

function addDiagnosis(diagnosis, index, result) {
  var diagnosisStatus = {
    "admitting": "at0016",
    "working": "at0017",
    "final": "at0018",
  }

  result['discharge_summary/diagnoses/problem_diagnosis:' + index + '/problem_diagnosis_name'] = diagnosis['DG1.3']['CE.1'];
  result['discharge_summary/diagnoses/problem_diagnosis:' + index + '/problem_diagnosis_status/diagnostic_status|code'] = diagnosisStatus[diagnosis['DG1.6'].toLowerCase()];
}

function addDischargeIdentifier(pids, result) {
  for (pid in pids) {
    var patientIdentifierType = pids[pid]['CX.5'];
    var patientIdentifier = pids[pid]['CX.1'];
    var path = 'discharge_summary/context/patient_identifiers/' + patientIdentifierType.toLowerCase();

    result[path] = pids[pid]['CX.1'];
    result[path + '|issuer'] = 'iEHR';
    result[path + '|assigner'] = 'iEHR';
    result[path + '|type'] = patientIdentifierType.toUpperCase();

    if (patientIdentifierType.search(new RegExp('MRN', 'i'))) {
      if (pids[pid]['CX.4'] !== undefined) {
        result['discharge_summary/context/patient_identifiers/discharging_organisation/name_of_organisation'] = pids[pid]['CX.4']['HD.1'];
      }
    }
  }
}

module.exports = {
  toOpenEhr: toOpenEhr,
  canHandle: canHandle
};

