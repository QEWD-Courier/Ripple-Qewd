# qewd-ripple

[![Build Status](https://travis-ci.org/RippleOSI/Ripple-Qewd.svg?branch=master)](https://travis-ci.org/RippleOSI/Ripple-Qewd)


Email: <code.custodian@ripple.foundation>

2016 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Introduction

*qewd-ripple* is a Node.js-based Middle Tier , built as a key element of the open platform showcase stack supported by the Ripple Foundation, based on the [QEWDjs framework](https://github.com/robtweed/qewd). 

Qewd-Ripple can be explained as; QewdJS related library for Ripple/Ripple is leveraging QewdJS .. so the terms Ripple-Qewd and Qewd-Ripple are used interchangeably here.

More details on the work of the [Ripple Foundation is available here](http://ripple.foundation/).

More details on QEWDjs is available at [QEWDjs.com](http://qewdjs.com/)


### Installing and Configuring the Ripple Foundation Node.js / QEWD-Ripple Middle Tier

Please follow ALL the steps listed below:

1) Assumptions

  The QEWD-Ripple Middle Tier is designed to run on a Linux
  platform (eg Ubuntu 16.04).  The embedded Redis or Open Source GT.M database is
  used as a high-performance cache and session store.

2) DO NOT install or configure QEWD-Ripple using the "root" username!  ALWAYS use a non-root username that
has *sudo* prvileges.

If your Linux machine / VM only has a root user, you'll need to create a non-root user with sudo privileges.

If you already log in to your Linux machine with a non-root user, the user will need to have sudo privileges.
You can check this by typing:

        groups

*sudo* should be one of the groups listed, eg:

        ripple@Ripple-2Gb-ShowcaseDemo-m3:~$ groups
        ripple sudo


To create a new user named *ripple* (change to whatever you want) (when logged in as root):

     adduser ripple

You'll be asked for a password.  You'll also be asked for user details which you can just leave blank by hitting
 the *Enter* key each time.

To give the user (*ripple* in this example) sudo privileges:

     usermod -aG sudo ripple


3) **Use *one* installer script from this repo to create the QEWD/Node.js-based Ripple 
 Middle Tier and UI**.  

*We suggest you either install *qewd-ripple* with Redis as its database*:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Qewd-Ripple/master/installer/install_ripple_redis.sh
      source install_ripple_redis.sh

(NB: during the installation, you'll be asked for the settings it should use for Redis & IPTables setup. 
Just accept all the default values by pressing the *{Enter}* key when asked.)


*OR install *qewd-ripple* with GT.M as its database*:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Qewd-Ripple/master/installer/install_ripple_gtm.sh
      source install_ripple_gtm.sh

N.B. Do not run both install scripts! There is another install script option, for a Raspberry Pi, see below.

The installer scripts install and configures the following:

- Redis or the Open Source GT.M database (used by Ripple stack's middle tier as a high-performance session cache and Document Store)
- Node.js
- QEWD
- The QEWD-based Ripple Stack Middle Tier
- The Ripple Showcase Pulsetile (User Interface) files
- A MySQL-based Patient Administration (PAS) database


4) When the installer has completed, you'll find two template startup files in the *~/qewd* directory:

- **ripple-demo.js**   (Designed to run the RippleOSI system in demo mode)
- **ripple-secure.js** (Designed to run the RippleOSI system in secure mode, using Auth0 for identity management)

### Demo Mode

If you just want to try out the Ripple Showcase stack via Qewd-Ripple, use the demo startup file - no changes are needed to it.  Just type the
following in a terminal window to start it up:

        cd ~/qewd
        node ripple-demo

In this mode, the UI will bypass the user login and you'll be automatically logged in as a user named Bob Smith, with access
to all the simulated patient data.


### Secure Mode

If you want proper user authentication, use the secure mode startup file.  This expects to use Auth0 as an OAuth2 
identity management provider.


You'll need to modify these lines in the *ripple-secure.js* file:

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

Once you've edited the *ripple-secure.js* file, you should now be able to start the RippleOSI Middle Tier by typing:


      cd ~/qewd
      node ripple-secure

The startup file (~/qewd/ripple-secure.js) is set up to listen in the clear via port 8081.  The nginx configuration
file (/etc/nginx/sites-available/default) is set up to provide the SSL service for your system and proxies the
ripple-secure QEWD system.  The qewd-ripple installer includes a self-signed certificate (installed in the 
~/qewd/ssl directory).  Switch these out for a proper SSL certificate and adjust the nginx SSL configuration in the 
*sites-available/default* file.


5) Point at the browser at the server's IP address and it should start up, eg:

      http://123.221.100.21

**Note**: as a last step, the installer attempts to add an *iptables* rule to map port 3000 to port 80.
On some systems it has been noticed that this step fails.  If this is the case, then the above 
URL will not work.  However, if you specify port 3000, it should burst into life, eg:

      http://123.221.100.21:3000


If you're running in secure mode, the first time you connect you'll be redirected to Auth0's Lock screen, 
through which you can log in.  

The Ripple Showcase Stack User Interface known as [PulseTile](http://ripple.foundation/pulsetile/) should then appear.


6) You'll probably want to run the Ripple-QEWD middle tier as a background service.  The easiest way is to use *PM2*
 which has already been installed for you.


If you want to run the demo mode as a service:

     cd ~/qewd
     pm2 start ripple-demo.js

The console output from the middle tier process is piped by PM2 to a log file in:

     ~/.pm2/logs

It will initially be:

     ~/.pm2/logs/ripple-demo-out-0.log

You can view it using:

     tail -f ~/.pm2/logs/ripple-demo-out-0.log

If, for some reason, the middle tier crashes, PM2 will automatically restart it.


To stop the middle tier service:

     pm2 stop ripple-demo

For more information about PM2, see:

[https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)


7) Monitoring what's going on in the QEWD layer

The *qewd-ripple* installer also installs the *qewd-monitor* application which is a useful tool for 
checking the health of your Ripple system, controlling its processes and viewing the Document Store and
QEWD Session data (in which OpenEHR data is cached for each user).

To run the *qewd-monitor* application, point your browser at:

      http://123.221.100.21/qewd-monitor/index.html

        Change the IP address as appropriate, and optionally specify port 3000

The default management password is *keepThisSecret!*

You can change this by editing the qewd-ripple startup file (~/qewd/ripple-demo.js or ~/qewd/ripple-secure.js). 
Add the property *managementPassword* to the *config* object, eg:

       var ewdRipple = require('qewd-ripple/lib/startup');
       
       var config = {
         managementPassword: 'myNewPassword',
         port: 3000,
         poolSize: 2,
         ripple: {
           mode: 'demo'
         }
       };
       
       ewdRipple.start(config);


## Updating the PulseTile User Interface

From time to time, updates to the PulseTile User Interface are released.  You can update your system by running the
*update-ui.sh* installer script that you'll find in your qewd-ripple repository directory at:

        ~/qewd/node_modules/qewd-ripple/installer/update-ui.sh

Run this by simply typing:

        source ~/qewd/node_modules/qewd-ripple/installer/update-ui.sh

*Note: DO NOT run this as root.  Log in using the same username that you used to install qewd-ripple, eg "ripple"*



## Installing and running Ripple Showcase stack on a Raspberry Pi

Believe it or not, it's also possible to install and run a fully-working Ripple showcase stack system on a Raspberry Pi!

If you want to give it a try, you should use a newly-installed version of Raspbian, ideally with 
no other software installed.  Then follow these steps:

      cd ~
      wget https://raw.githubusercontent.com/RippleOSI/Qewd-Ripple/master/installer/install_ripple_rpi.sh
      source install_ripple_rpi.sh

Be patient - it takes time to build Redis and the MySQL database server in particular, but once it 
completes, you'll have a fully-working QEWD and Ripple system.

Note: during the installation, you'll be asked for the settings it should use for Redis.  Just accept
all the default values by pressing the *Enter* key when asked.

PM2 and nginx (which acts as a proxy) are installed and configured for you, and the QEWD Ripple system is 
automatically started and managed for you as a service by PM2.

So, on completion of the installer, all you need to do is point a browser at the IP address of
your Raspberry Pi, eg:

      http://192.168.1.75

and RippleOSI should burst into life!


To run the qewd-monitor application:

      http://192.168.1.75/qewd-monitor/index.html

The default management password is: *keepThisSecret!*

You can change this by editing the *qewd-ripple* startup file (*~/qewd/ripple-rpi.js*). 
Add the property *managementPassword* to the *config* object, eg:


       var ewdRipple = require('qewd-ripple/lib/startup');
       
       var config = {
         managementPassword: 'myNewPassword',
         port: 3000,
         poolSize: 2,
         ripple: {
           mode: 'demo'
         },
         database: {
           type: 'redis'
         }
       };
       
       ewdRipple.start(config);


Restart QEWD-Ripple using:

        pm2 stop ripple-rpi
        pm2 start ripple-rpi



## About QEWD.js

For further information on QEWD.js, see http://qewdjs.com



## License

  Copyright (c) 2016-17 Ripple Foundation Community Interest Company
  All rights reserved.

  http://ripple.foundation
  Email: code.custodian@ripple.foundation                                                                          

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at                                  

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.


## Product/Project Support
This product /project is supported by the Ripple Foundation, who aim to enhance the Ripple-Qewd framework, as part of our open platform mission in healthcare. 
We are working to fund as many of the enhancements of Ripple-Qewd as we can based on projects that our non profit organisation supports.

We will try to fix any key bugs and documentation errors ourselves. 
Other issues, requests for enhancements or feature additions, will be added to the project backlog.

The Ripple Foundation is committed to offering free and open software, with quality, free and open documentation, but unfortunately is unable to offer free support for all issues/pull requests in the backlog.

(Our latest thinking on the best model to support our open platform mission in healthcare may best be understood by reading this article. https://opensource.com/business/16/4/refactoring-open-source-business-models

If you would like to offer some of your energy/ suggest other ideas towards progressing an open platform in healthcare, please contact us at info@ripple.foundation )

If you need support with a particular issue/pull request, please let us know and we can consider a bounty source (https://www.bountysource.com/), to get these reviewed / addressed.

Thanks for your interest in Ripple-Qewd

The Ripple Foundation

http://ripple.foundation/
 
