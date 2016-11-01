# rippleosi-ewd3

Email: <code.custodian@rippleosi.org>
2016 Ripple Foundation Community Interest Company [http://rippleosi.org  ](http://rippleosi.org)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Introduction

rippleosi-ewd3 is a Node.js-based Middle Tier for the Ripple OSI 
project.

## Installing

       This module in isolation: 

         npm install ewd-ripple

### Installing and Configuring the RippleOSI Node.js / EWD 3 Middle Tier

1) Assumptions

  The EWD 3 Middle Tier for RippleOSI is designed to run on a Linux
  platform (eg Ubuntu 16.04).  The embedded Open Source GT.M database is
  used as a high-performance cache and session store.


 2) Install the EWD 3 Node.js-based Run-time Environment

       cd ~
       wget https://raw.githubusercontent.com/robtweed/ewd-3-installers/master/ewd-xpress/install_gtm.sh
       source install_gtm.sh

  The installer will create a new directory: ~/ewd3
  The EWD 3 run-time environment is created under this directory.

3) Now use this installer to create the EWD 3 Node.js-based Ripple 
 Middle Tier and UI:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-NodeJS-EWD3/master/installer/install-ripple-ewd3.sh
      source install-ripple-ewd3.sh


4) You should now be able to start it by typing:

      cd ~/ewd3
      node start-rippleosi-ewd3

5) Point at the browser at the server's IP address and it should start up


### Replacing An Existing RippleOSI Middle Tier

If you're already using the RippleOSI application with an Apache Tomcat / Java middle tier,
you can migrate it to use the Node.js / EWD 3 middle tier by following the steps below:

#### Create a non-Root user

If you only have Root access, you should add a non-Root user.  The username can be anything you like.  The example below assumes the
new username is "ripple". You'll be asked to define a password for this user:

       adduser ripple

After answering all the questions (most of which can be left blank), give the new user sudo access rights:

       usermod -aG sudo ripple

Switch to this user:

       su - ripple

#### Install the EWD 3 Node.js-based Run-time Environment

       cd ~
       wget https://raw.githubusercontent.com/robtweed/ewd-3-installers/master/ewd-xpress/install_gtm.sh
       source install_gtm.sh

The installer will create a new directory: ~/ewd3
The EWD 3 run-time environment is created under this directory.

#### Install the ewd-ripple Middle Tier module and associated client code:

      cd ~/ewd3
      npm install ewd-client ewd-ripple

#### Move various files into place:

      sudo cp ~/ewd3/node_modules/ewd-client/lib/proto/ewd-client.js /opt/tomcat/ripple/ewd-client.js
      cp ~/ewd3/node_modules/ewd-ripple/example/start-rippleosi-ewd3.js ~/ewd3/start-rippleosi-ewd3.js
      sudo cp ~/ewd3/node_modules/ewd-ripple/www/ewd-ripple.js /opt/tomcat/ripple/ewd-ripple.js


#### Modify two RippleOSI UI files

As an interim measure, two small changes must be made to the index.html and index.js files used by the RippleOSI UI:

1) Edit /opt/tomcat/ripple/index.html - edit the </head> tag and insert the following tags before it:

      <script src="/ewd-client.js"></script>
      <script src="/socket.io/socket.io.js"></script>
      <script src="ewd-ripple.js"></script>


1) Edit /opt/tomcat/ripple/index.js - At approximately line 259 you'll find a line:

        console.log("app start");

Add the following after this line:

        console.log('starting ewd-ripple');
        startEwdRipple();

This establishes an EWD Session within the middle tier, and assigns its token to a cookie which will be subsequently sent with every REST 
request to the middle tier.

#### Map port 3000 to port 80:

        sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

The UI will now connect to the EWD 3 / Node.js middle tier instead of the Tomcat/Java one

To switch back to using the Java middle tier, simply remove the iptables mapping:

        sudo iptables -t nat -D PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000


#### Finally, start the EWD 3 Middle Tier:

        cd ~/ewd3
        node start-rippleosi-ewd3

You can now load the RippleOSI UI in your browser and you'll begin to see activity in the EWD 3 / Node.js process.



## License

  Copyright (c) 2016 Ripple Foundation Community Interest Company
  All rights reserved.

  http://rippleosi.org
  Email: code.custodian@rippleosi.org                                                                          

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at                                  

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

