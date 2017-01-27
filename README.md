# qewd-ripple

[![Build Status](https://travis-ci.org/RippleOSI/Qewd-Ripple.svg?branch=master)](https://travis-ci.org/RippleOSI/Qewd-Ripple)


Email: <code.custodian@rippleosi.org>
2016 Ripple Foundation Community Interest Company [http://rippleosi.org  ](http://rippleosi.org)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Introduction

qewd-ripple is a Node.js-based Middle Tier for the Ripple OSI project, based on the QEWD framework.


### Installing and Configuring the RippleOSI Node.js / QEWD Middle Tier

Please follow ALL the steps listed below:

1) Assumptions

  The QEWD Middle Tier for RippleOSI is designed to run on a Linux
  platform (eg Ubuntu 16.04).  The embedded Open Source GT.M database is
  used as a high-performance cache and session store.

2) If your Linux machine / VM only has a root user, you'll need to create a non-root user with sudo privileges.
If you already log in to your Linux machine with a non-root user, the user will need sudo privileges.

To create a new user named ripple (change to whatever you want) (when logged in as root):

     adduser ripple

You'll be asked for a password.  You'll also be asked for user details which you can just leave blank by hitting the Enter key 
each time.

To give the user sudo privileges:

     usermod -aG sudo ripple


3) Use the installer script from this repo to create the EWD 3 Node.js-based Ripple 
 Middle Tier and UI:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Qewd-Ripple/master/installer/install_ripple.sh
      source install_ripple.sh

The installer script installs and configures the following:

- The Open Source GT.M database (used by RippleOSI's middle tier as a high-performance session cache)
- Node.js
- QEWD
- The QEWD-based RippleOSI Middle Tier
- The RippleOSI User Interface files
- A MySQL-based Patient Administration (PAS) database


3) When the installer has completed, you'll find two template startup files in the ~/qewd directory:

- ripple-demo.js   (Designed to run the RippleOSI system in demo mode)
- ripple-secure.js (Designed to run the RippleOSI system in secure mode, using Auth0 for identity management)

### Demo Mode

If you just want to try out RippleOSI, use the demo startup file - no changes are needed to it.  Just type the
following in a terminal window to start it up:

        cd ~/qewd
        node ripple-demo

In this mode, the UI will bypass the user login and you'll be automatically logged in as a user named Bob Smith, with access
to all the simulated patient data.


### Secure Mode

If you want proper user authentication, use the secure mode startup file.  This expects to use Auth0 as an OAuth2 
identity management provider.


You'll need to modify these lines in the ripple-secure.js file:

       var config = {
        auth0: {
          domain:       'xxxxxxxxx.eu.auth0.com',
          clientID:     'xxxxxxxxxxxxxxxxxxxxxxxx',
          callbackURL:  'http://xxx.xxx.xxx.xxx/auth0/token',
          clientSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',


to correspond with the values for your Auth0 client.  You can set up a client for free on Auth0 (https://auth0.com/)

The callbackURL should use the IP address/domain name of
the server on which you've installed RippleOSI, but must point to /auth0/token on this machine.  The callbackURL
must be defined as an allowed callback URL in your Auth0 client configuration.

Once you've edited the ripple-secure.js file, you should now be able to start the RippleOSI Middle Tier by typing:


      cd ~/qewd
      node ripple-secure


5) Point at the browser at the server's IP address and it should start up, eg:

      http://123.221.100.21


If you're running in secure mode, the first time you connect you'll be redirected to Auth0's Lock screen, 
through which you can log in.  

The RippleOSI User Interface should then appear.


6) You'll probably want to run the Ripple middle tier as a background service.  The easiest way is to use PM2
 which has already been installed for you.


If you want to run the demo mode as a service:

     cd ~/qewd
     pm2 start ripple-demo.js

The console output from the middle tier process is piped by PM2 to a log file in:

     ~/.pm2/logs

It will initially be:

     ~/.pm2/logs/ripple-demo-out-0.log

YOu can view it using:

     tail -f ~/.pm2/logs/ripple-demo-out-0.log

If, for some reason, the middle tier crashes, PM2 will automatically restart it.


To stop the middle tier service:

     pm2 stop ripple-demo

For more information about PM2, see:

[https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)



## License

  Copyright (c) 2016-17 Ripple Foundation Community Interest Company
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

