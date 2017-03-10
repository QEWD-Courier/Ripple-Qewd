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

  30 January 2017

*/

var xml2js = require('xml2js');
var underTest = require('./../../lib/documents/healthlink/healthlink');
var fs = require('fs');

describe("healthlink.getReferral", function() {
    it("can map a given input XML referral into a FLAT JSON representation", function() {
        var healthlinkReferral = JSON.parse(fs.readFileSync('spec/documents/resources/healthlink.referral.json', 'utf8'));       
        
        var openEhrReferral = underTest.toOpenEhr(healthlinkReferral);
  
        expect(openEhrReferral['ctx/composer_name']).toBe("TEST, HPM");
        expect(openEhrReferral['ctx/health_care_facility|id']).toBe("012121");
        expect(openEhrReferral['referral/referral_details/service_request/referred_to_provider/identifier']).toBe("Royal Victoria Eye and Ear Hospital");
        expect(openEhrReferral['referral/referral_details/service_request/referral_control_number']).toBe("REF20160114104549012121");
        expect(openEhrReferral['referral/referral_details/service_request/request:0/timing']).toBe("Boilerplate timing string");
        expect(openEhrReferral['referral/referral_details/referral_status/ism_transition/current_state|code']).toBe("526");
        expect(openEhrReferral['referral/referral_details/referral_status/ism_transition/current_state|value']).toBe("planned");
        expect(openEhrReferral['referral/referral_details/referral_status/ism_transition/careflow_step|code']).toBe("at0002");
        expect(openEhrReferral['referral/referral_details/referral_status/ism_transition/careflow_step|value']).toBe("Referral planned");
        expect(openEhrReferral['referral/referral_details/referral_status/referral_type']).toBe("General");
        expect(openEhrReferral['referral/referral_details/service_request/request:0/referral_type']).toBe("General");
        expect(openEhrReferral['referral/referral_details/service_request/narrative']).toBe("General");

        expect(openEhrReferral['referral/referral_details/service_request/referring_provider/identifier']).toBe("b841ffc7-49c8-4813-8eb5-c0073bf1f815");    
        expect(openEhrReferral['ctx/health_care_facility|name']).toBe("The Medical Centre");    
        expect(openEhrReferral['referral/referral_details/service_request/distribution:0/individual_recipient:0/gp/name_of_organisation']).toBe("The Medical Centre");    
        expect(openEhrReferral['referral/referral_details/service_request/referring_provider/name_of_organisation']).toBe("The Medical Centre");    
        expect(openEhrReferral['referral/referral_details/service_request/distribution/individual_recipient/gp/wpn/work_number']).toBe("022 21551");    
        expect(openEhrReferral['referral/referral_details/service_request/referred_to_provider/name_of_organisation']).toBe("15 Beecher Street");       

        // TODO - contact details & observations
    });
});

describe("healthlink.getDischarge", function() {
    it("can map a given input XML discharge into a FLAT JSON representation", function() {
        var healthlinkDischarge = JSON.parse(fs.readFileSync('spec/documents/resources/healthlink.discharge.json', 'utf8'));       
        
        var openEhrDischarge = underTest.toOpenEhr(healthlinkDischarge);

        // context
        expect(openEhrDischarge['ctx/composer_id']).toBe("023781");
        expect(openEhrDischarge['ctx/composer_name']).toBe("McCrea, Siobhan");
        expect(openEhrDischarge['ctx/health_care_facility|id']).toBe("904");  
        expect(openEhrDischarge['ctx/health_care_facility|name']).toBe("St.James's Hospital (Dublin)");  
        
        // discharge = receiving facility & notes
        expect(openEhrDischarge['discharge_summary/composer|id_scheme']).toBe("Medical Council No");
        expect(openEhrDischarge['discharge_summary/clinical_summary/clinical_synopsis/synopsis']).toBe("ADMISSION REASON: Admit with acute abdominal pain, deranged LFTs, normal amylase DIAGNOSIS: Cholecystectomy PROBLEMS: Abdominal pain PROBLEMS: Gallstones THEATRE PROCS: Lap Chole NON THEATRE PROCS: None LAB INVESTIGATIONS: As attached - FBC, UE, LFTs, Amylase RAD INVESTIGATIONS: As attached - USS Abdomen, MRCP OTHER INVESTIGATIONS: None PROGRESS DURING STAY: Uncomplicated post operative recovery.  Full diet tolerated, wound sites dry and intact, no oozing.  Vital signs normal, apyrexial.  Mobilising/teds/clexane.  No c/o abdominal pain.  C/O right shoulder tip pain - advised post operative complication and should resolve within several days.  Normal MRCP pre-op.  Dx = acute cholecystitis with transiemt choledocholithiasis. ALLERGIES: NKDA DISCHARGE MEDICATION: MEDICATION:Refused analgesia on d/c INFO GIVEN TO PATIENT: All results and surgery as above explained.  For removal of clips in 10/7 in dressing clinic - appt given.  Avoid constipation OPD FOLLOW UP: 6/52 GP ACTIONS: Routine follow up");
        
        // diagnoses
        expect(openEhrDischarge['discharge_summary/diagnoses/problem_diagnosis:0/problem_diagnosis_name']).toBe("Cholecystectomy");
        expect(openEhrDischarge['discharge_summary/diagnoses/problem_diagnosis:0/problem_diagnosis_status/diagnostic_status|code']).toBe("at0017");

        // discharge identifier - MRN
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/mrn']).toBe("9999999000");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/mrn|issuer']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/mrn|assigner']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/mrn|type']).toBe("MRN");

        // discharge identifier - GMS
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/gms']).toBe("-");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/gms|issuer']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/gms|assigner']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/gms|type']).toBe("GMS");

        // discharge identifier - OTH
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/oth']).toBe("1020714");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/oth|issuer']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/oth|assigner']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/context/patient_identifiers/oth|type']).toBe("OTH");
       
        // Professional identifier
        expect(openEhrDischarge['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier']).toBe("4547");
        expect(openEhrDischarge['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|issuer']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|assigner']).toBe("iEHR");
        expect(openEhrDischarge['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_identifier|type']).toBe("MCN");
        expect(openEhrDischarge['discharge_summary/discharge_details/discharge_details_uk_v1/responsible_professional/professional_name/name']).toBe("COOKE MR FIACHRA");
    });
}); 

describe("healthlink.getInternalPatientId", function() {
    it("can extract a patient identifier from the input XML", function() {
        var json = JSON.parse(fs.readFileSync('spec/documents/resources/healthlink.discharge.json', 'utf8'));       
        var internalPatientId = underTest.getInternalPatientId(json);
        
        expect(internalPatientId).toBe("9999999000");
        
        json = JSON.parse(fs.readFileSync('spec/documents/resources/healthlink.referral.json', 'utf8'));       
        internalPatientId = underTest.getInternalPatientId(json);
        
        expect(internalPatientId).toBe("9999999000");
    });
}); 
       
   