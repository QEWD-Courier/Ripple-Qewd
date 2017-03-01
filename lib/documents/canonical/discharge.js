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

  01 February 2017

*/

function getDocumentType() {
    return 'Discharge summary';
}

function canHandle(openEhrDocument) {
    var isDocument = false;
    
    const properties = Object.keys(openEhrDocument);
    for(var p = 0; (p < properties.length && isDocument === false); p++) {
        const property = properties[p];

        isDocument = property.startsWith('discharge_summary');
    }

    return isDocument;
}

var fieldMap = {
    'discharge_summary/_uid': {
        field: 'sourceId'
    },
    'discharge_summary/composer|name': {
        field: 'author_name'
    },   
    'discharge_summary/composer|id': {
        field: 'author_id'
    },   
    'discharge_summary/composer|id_scheme': {
        field: 'author_idScheme'
    }, 
    'discharge_summary/context/start_time' : {
        field: 'documentDate'
    },
    'discharge_summary/context/_health_care_facility|name': {
        field: 'facility'
    },  
    'discharge_summary/context/patient_identifiers/mrn': {
        field: 'patientIdentifier_mrn'
    },   
    'discharge_summary/context/patient_identifiers/mrn|type': {
        field: 'patientIdentifier_mrnType'
    },   
    'discharge_summary/context/patient_identifiers/oth': {
        field: 'patientIdentifier_oth'
    },     
    'discharge_summary/context/patient_identifiers/oth|type': {
        field: 'patientIdentifier_othType'
    }, 
    'discharge_summary/context/patient_identifiers/gms': {
        field: 'patientIdentifier_gms'
    },
    'discharge_summary/context/patient_identifiers/gms|type': {
        field: 'patientIdentifier_gmsType'
    },
    'discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_name/name': {
        field: 'responsibleProfessional_name'
    },
    'discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier': {
        field: 'responsibleProfessional_id'
    },   
    'discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|type': {
        field: 'responsibleProfessional_idType'
    },
    'discharge_summary/discharge_details/discharge_details_uk_v1/discharging_organisation/name_of_organisation': {
        field: 'dischargingOrganisation'
    },   
    'discharge_summary/discharge_details/discharge_details_uk_v1/discharging_organisation/name_of_organisatio/date_time_of_discharge': {
        field: 'dateTimeOfDischarge'
    },     
    'discharge_summary/clinical_summary/clinical_synopsis/synopsis': {
        field: 'clinicalSynopsis'
    },    
    'discharge_summary/admission_details/inpatient_admission/date_of_admission': {
        field: 'dateOfAdmission'
    }, 
    'discharge_summary/diagnoses/problem_diagnosis': {
            field: 'diagnosisList',
            fieldMap: {
                'problem_diagnosis_name' : {
                    field: 'problem'
                },
                'problem_diagnosis_status/diagnostic_status|value' : {
                    field: 'description'
                },
                'problem_diagnosis_status/diagnostic_status|terminology' : {
                    field: 'terminology'
                },
                'problem_diagnosis_status/diagnostic_status|code' : {
                    field: 'terminologyCode'
                },                                                                                                           
            }
      }      
}

module.exports = {
    fieldMap: fieldMap,
    getDocumentType: getDocumentType,
    canHandle: canHandle
};