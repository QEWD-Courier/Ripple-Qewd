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
       sudo apt-get -y install git
       git clone https://github.com/robtweed/ewd-3-installers
       source ewd-3-installers/ewd-xpress/install_gtm.sh

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

