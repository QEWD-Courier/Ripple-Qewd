Ripple WebRTC Socket Server
=========

This directory contains the code base for the Ripple WebRTC Socket Server, which is a separately packaged NodeJS project 
that runs alongside the Ripple UI (Org-Ripple-UI) and Ripple Java Middleware (Org-Ripple-Middleware).
 

### Requirements

To develop and run the application locally you must have the following installed:
* NodeJS >= v6.2.0
* A running version of the Ripple UI 
* A running version of the Ripple Middleware
* Two users, both of whom are connected to separate networks, logged in as a patient and clinician


### Installation

1. Open a shell and navigate to the socket-server directory 
2. Run 'npm install'
2. Run 'node socket'


### Optional Installation

1. Install pm2, which is a NodeJS daemon which can run the socket server in the background, by running 'npm install -g pm2'
2. Run the socket server in the background by running 'pm2 start pm2.json'
3. Save the pm2 daemon configuration by running 'pm2 save'

### Configuration

The database connection details (MySQL) located in the socket-server/lib/db.js file. Feel free to change these credentials 
according to your database configuration and schema.
