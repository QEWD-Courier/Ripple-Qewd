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
 | Author: Dinesh Patel - Leidos                           |
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

 08 February 2017

*/

var dateTime = require('../dateTime')

var heading = {
  name: 'vitalsigns',
  textFieldName: 'author',
  headingTableFields: ['author', 'dateCreate',  'newsScore', 'respirationRate', 'oxygenSupplemental', 
    'heartRate', 'temperature', 'levelOfConsciousness', 'systolicBP', 'diastolicBP', 'oxygenSaturation'],
  fieldMap: {
    respirationRate: 'respiratoryRate',
    oxygenSupplemental: function(data) {
      return data.onAir === true ? 'false' : 'true';
    },
    heartRate: 'heartRate',
    temperature: 'temperature',
    levelOfConsciousness: function(data) {
      switch (data.levelOfConsciousnessCode) {
        case "at0005":
          return "Alert";
          break;
        case "at0006":
          return "Voice";
          break;
        case "at0007":
          return "Pain";
          break;
        case "at0008":
          return "Unresponsive";
          break;
      }
    },
    systolicBP: 'systolic',
    diastolicBP: 'diastolic',
    oxygenSaturation: 'oxygenSats',
    newsScore: 'newsScore',
    author: 'author',
    dateCreate: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - Vital Signs Encounter.v1',
    //   destination: 'marand',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',
        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        default: 'Ripple View Care Home'
      },
      'ctx/id_namespace': {
        default: 'NHS-UK'
      },
      'ctx/id_scheme': {
        default: '2.16.840.1.113883.2.1.4.3'
      },
      'ctx/language': {
        default: 'en'
      },
      'ctx/territory': {
        default: 'GB'
      },
      'ctx/time': {
        field: 'dateCreate',
        default: function(data) {
          return dateTime.format(new Date());
        }
      },
      'vital_signs_observations/vital_signs/respirations/rate|magnitude': {
        field: 'respirationRate'
      },
      'vital_signs_observations/vital_signs/respirations/inspired_oxygen/on_air': {
        default: function(data) {
          var boolValue = (data.oxygenSupplemental === 'true');
          // return the inverted value as a string
          return boolValue ? 'false' : 'true';
        }
      },
      'vital_signs_observations/vital_signs/pulse_heart_beat/heart_rate|magnitude': {
        field: 'heartRate'
      },
      'vital_signs_observations/vital_signs/body_temperature/temperature|magnitude': {
        field: 'temperature'
      },
      'vital_signs_observations/vital_signs/avpu/avpu_observation|code': {
        default: function(data) {
          switch (data.levelOfConsciousness) {
            case "Alert":
              return "at0005";
              break;
            case "Voice":
              return "at0006";
              break;
            case "Pain":
              return "at0007";
              break;
            case "Unresponsive":
              return "at0008";
              break;
          }
        }
      },
      'vital_signs_observations/vital_signs/blood_pressure/systolic|magnitude': {
        field: 'systolicBP'
      },
      'vital_signs_observations/vital_signs/blood_pressure/diastolic|magnitude': {
        field: 'diastolicBP'
      },
      'vital_signs_observations/vital_signs/indirect_oximetry/spo2|numerator': {
        field: 'oxygenSaturation'
      },
      'vital_signs_observations/vital_signs/news_uk_rcp/total_score': {
        field: 'newsScore'
      }
    }
  }
};

module.exports = heading;



