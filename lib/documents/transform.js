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


var traverse = require('traverse');

  var mapArray = function(dataArray, templateObj) {
    console.log('!!! dataArray: ' + JSON.stringify(dataArray));
    console.log('templateObj = ' + JSON.stringify(templateObj));
    if (Array.isArray(dataArray)) {
      var outputArr = [];
      dataArray.forEach(function(obj) {
        var result = transform(templateObj, obj);
        outputArr.push(result);
      });
      console.log('outputArr = ' + JSON.stringify(outputArr));
      return outputArr;
    }
    else {
      return '';
    }
  }

function transform(templateObj, data, helpers) {

  function getActualValue(templateRef, data) {
    var pieces = templateRef.split("{{");
    var objRef = pieces[1];
    var before = pieces[0];
    pieces = objRef.split("}}");
    objRef = pieces[0];
    var after = pieces[1];
    var fn = new Function('data', 'return data.' + objRef + ';');
    console.log('fn: ' + fn);
    try {
      var result = before + fn(data) + after;
      return result;
    }
    catch(err) {
      return '';
    }
  }

  var outputObj = traverse(templateObj).map(function(node) {
    if (typeof node === 'function') {
      console.log('argument = ' + arguments[0]);
      this.update(node(data));
    }

    else if (Array.isArray(node)) {
      if (node[0].indexOf('{{') !== -1) {
        var dataArr = getActualValue(node[0], data);
        var template = node[1];
        var outputArr = mapArray(dataArr, template);
        console.log('** outputArr = ' + JSON.stringify(outputArr));
        this.update(outputArr);
      }
    }

    else if (typeof node === 'string') {
      if (node.indexOf('{{') !== -1) {
        this.update(getActualValue(node, data));
      }
    }
  });
  return outputObj;
}

module.exports = transform;
