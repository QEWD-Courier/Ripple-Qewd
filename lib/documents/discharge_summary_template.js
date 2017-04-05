
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
    sourceId:                       '{{discharge_summary._uid}}',
    author_name:                    '{{discharge_summary["composer|name"]}}', 
    author_id:                      '{{discharge_summary["composer|id"]}}',
    author_idScheme:                '{{discharge_summary["composer|id_scheme"]}}',
    documentDate:                   '=> getTime(discharge_summary.context.start_time)',
    facility:                       '{{discharge_summary.context["_health_care_facility|name"]}}',
    patientIdentifier_mrn:          '{{discharge_summary.context.patient_identifiers.mrn}}',
    patientIdentifier_mrnType:      '{{discharge_summary.context.patient_identifiers["mrn|type"]}}',
    patientIdentifier_oth:          '{{discharge_summary.context.patient_identifiers.oth}}',
    patientIdentifier_othType:      '{{discharge_summary.context.patient_identifiers["oth|type"]}}',
    patientIdentifier_gms:          '{{discharge_summary.context.patient_identifiers.gms}}',
    patientIdentifier_gmsType:      '{{discharge_summary.context.patient_identifiers["gms|type"]}}',
    responsibleProfessional_name:   '{{discharge_summary.discharge_details.discharge_details_uk_v1.responsible_professional.professional_name.name}}',
    responsibleProfessional_id:     '{{discharge_summary.discharge_details.discharge_details_uk_v1.responsible_professional.professional_identifier}}',
    responsibleProfessional_idType: '{{discharge_summary.discharge_details.discharge_details_uk_v1.responsible_professional["professional_identifier|type"]}}',
    dischargingOrganisation:        '{{discharge_summary.discharge_details.discharge_details_uk_v1.discharging_organisation.name_of_organisation}}',
    dateTimeOfDischarge:            '{{discharge_summary.discharge_details.discharge_details_uk_v1.discharging_organisation.name_of_organisatio.date_time_of_discharge}}',
    clinicalSynopsis:               '{{discharge_summary.clinical_summary.clinical_synopsis.synopsis}}',
    dateOfAdmission:                '{{discharge_summary.admission_details.inpatient_admission.date_of_admission}}',

    diagnosisList: [
      '{{discharge_summary.diagnoses.problem_diagnosis}}',
      {
        problem:         '{{problem_diagnosis_name}}',
        description:     '{{problem_diagnosis_status["diagnostic_status|value"]}}',
        terminology:     '{{problem_diagnosis_status["diagnostic_status|terminology"]}}',
        terminologyCode: '{{problem_diagnosis_status["diagnostic_status|code"]}}'
      }
    ]

};

module.exports = outputTemplate;
