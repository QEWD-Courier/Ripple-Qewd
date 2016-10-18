/*

 ----------------------------------------------------------------------------
 | ewd-ripple: ewd-xpress Middle Tier for Ripple OSI                        |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

 21 September 2016

*/

var mysql = require('mysql');

module.exports = {

  connect: function(callback) {
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: 'poc_legacy'
    });

    con.connect(function(err){
      if (err) {
        callback({error: 'Unable to connect to MySQL: ' + err});
        return;
      }
      console.log('Connected to MySQL');
    });
    return con;
  },
  disconnect: function(connection) {
    console.log('Disconnected from MySQL');
    connection.end();
  }
};