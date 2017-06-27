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
 | Author: Dinesh Patel - Leidos                                            |
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

 8 June 2017

*/

var heading = {
  name: 'vitalsignspaging',
  textFieldName: 'author',
   headingTableFields: ['author', 'dateCreated',  'newsScore', 'respirationRate', 'oxygenSupplemental', 
    'heartRate', 'temperature', 'levelOfConsciousness', 'systolicBP', 'diastolicBP', 'oxygenSaturation'],
  get: {

    helperFunctions: {
      getOnAir: function(onAir) {
        var oppBool = (onAir !== 'true');
        return oppBool.toString();
      },
      getLevelOfConsciousness: function(levelOfConsciousnessCode) {
        switch (levelOfConsciousnessCode) {
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
          default:
            return 'Not known'
        }
      }
    },

    transformTemplate: {
      respirationRate:      '{{respiratoryrate}}',
      oxygenSupplemental:   '=> getOnAir(onair)',
      heartRate:            '{{heartrate}}',
      temperature:          '{{temperature}}',
      levelOfConsciousness: '=> getLevelOfConsciousness(levelofconsciousnesscode)',
      systolicBP:           '{{systolic}}',
      diastolicBP:          '{{diastolic}}',
      oxygenSaturation:     '{{oxygensats}}',
      newsScore:            '{{newsscore}}',
      author:               '{{author}}',
      dateCreated:          '=> getRippleTime(date_created)',
      source:               '=> getSource()',
      sourceId:             '=> getUid(uid)'
    }

  }
};

module.exports = heading;
