/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

1 November 2016

*/

function startEwdRipple() {

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length);
      }
    }
    return "";
  }

  EWD.on('ewd-registered', function() {
    // add EWD session token to cookie so it gets sent with every REST request
    EWD.log = true;

    // First check if there's an existing cookie EWD token  
    //  If so, is it for an active session?  If so, leave it alone
    //  If not, reset the cookie with the newly-created token and
    //    repopulate the patient cache ready for subsequent REST requests

    var ewdToken = getCookie('ewd-token');
    if (ewdToken !== '') {
      EWD.send({
        type: 'checkToken',
        params: {
          token: ewdToken
        }
      }, function(responseObj) {
        // if it's a currently active sesssion, leave the cookie alone
        // otherwise update it with the new one
        if (responseObj.message.expired) {
          EWD.setCookie();
          EWD.send({
            type: 'authenticate'
          });
        }
      });
    }
    else {
      // no existing cookie so create a new one with the latest token
      EWD.setCookie();
      EWD.send({
        type: 'authenticate'
      });
    }
  });

  EWD.start('ewd-ripple', null, io);
}
