# rippleosi-ewd3

Email: <code.custodian@rippleosi.org>
2016 Ripple Foundation Community Interest Company [http://rippleosi.org  ](http://rippleosi.org)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Introduction

rippleosi-ewd3 is a Node.js-based Middle Tier for the Ripple OSI 
project.


### Installing and Configuring the RippleOSI Node.js / EWD 3 Middle Tier

1) Assumptions

  The EWD 3 Middle Tier for RippleOSI is designed to run on a Linux
  platform (eg Ubuntu 16.04).  The embedded Open Source GT.M database is
  used as a high-performance cache and session store.


2) Use this installer to create the EWD 3 Node.js-based Ripple 
 Middle Tier and UI:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-NodeJS-EWD3/master/installer/install_ripple.sh
      source install_ripple.sh

The installer script installs and configures the following:

- The Open Source GT.M database (used by RippleOSI's middle tier as a high-performance session cache)
- Node.js
- The EWD 3 / Node.js-based RippleOSI Middle Tier
- The RippleOSI User Interface files
- A MySQL-based Patient Administration (PAS) database


3) When the installer has completed, you'll find two template startup files in the ~/ewd3 directory:

- ripple-demo.js   (Designed to run the RippleOSI system in demo mode)
- ripple-secure.js (Designed to run the RippleOSI system in secure mode, using Auth0 for identity management)

You need to modify these lines:

       var config = {
        auth0: {
          domain:       'xxxxxxxxx.eu.auth0.com',
          clientID:     'xxxxxxxxxxxxxxxxxxxxxxxx',
          callbackURL:  'http://xxx.xxx.xxx.xxx/auth0/token',
          clientSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',


to correspond with the values for your Auth0 client.  The callbackURL should use the IP address/domain name of
the server on which you've installed RippleOSI, but must point to /auth0/token on this machine.  The callbackURL
must be defined as an allowed callback URL in your Auth0 client configuration.

You may need to also modify this line:

      webServerRootPath: '/home/ripple/ewd3/www',

Change "/ripple/" for the user name you used when installing RippleOSI (eg "/ubuntu/" on an Amazon EC2 machine)


You should now be able to start it by typing:

      cd ~/ewd3
      node ripple-demo

or

      cd ~/ewd3
      node ripple-secure

5) Point at the browser at the server's IP address and it should start up

If you're running in secure mode, the first time you connect you'll be redirected to Auth0's Lock screen, 
through which you can log in.  




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

