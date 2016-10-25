#!/usr/bin/env bash

echo "-----------------------------------------------------------------------"
echo " Installing MySQL Server..."
echo "-----------------------------------------------------------------------"

# Set default MySQL password to get rid of the prompt during install
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password password'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password password'

# Install MySQL packages
sudo apt-get install -y mysql-server
sudo service mysql start

# Get the database scripts
cd ~

wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-Middleware/develop/ripple-database/src/main/resources/sql/legacy/create_database_and_tables.sql
wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-Middleware/develop/ripple-database/src/main/resources/sql/legacy/populate_general_practitioners_table.sql
wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-Middleware/develop/ripple-database/src/main/resources/sql/legacy/populate_medical_departments_table.sql
wget https://raw.githubusercontent.com/RippleOSI/Org-Ripple-Middleware/develop/ripple-database/src/main/resources/sql/legacy/populate_patients_table.sql

# Run the scripts
mysql -u root -ppassword < ~/create_database_and_tables.sql
mysql -u root -ppassword < ~/populate_general_practitioners_table.sql
mysql -u root -ppassword < ~/populate_medical_departments_table.sql
mysql -u root -ppassword < ~/populate_patients_table.sql

# Delete scripts
sudo rm ~/create_database_and_tables.sql
sudo rm ~/populate_general_practitioners_table.sql
sudo rm ~/populate_medical_departments_table.sql
sudo rm ~/populate_patients_table.sql

echo "-----------------------------------------------------------------------"
echo " MySQL environment and data set up"
echo "-----------------------------------------------------------------------"


echo "-----------------------------------------------------------------------"
echo " Initialising deployment environment..."
echo "-----------------------------------------------------------------------"

# Retrieve the deployment war file
cd ~
wget http://nexus.rippleosi.org/repository/maven-releases/org/rippleosi/demo/ripple-demonstrator/0.8.0.0/ripple-demonstrator-0.8.0.0.war

# Move the war to the EWD 3 webserver root directory

sudo mv ripple-demonstrator-0.8.0.0.war ~/ewd3/www/ripple-demonstrator.zip

# Install Unzip
sudo apt-get install -y unzip

# Unpack the war
cd ~/ewd3/www
unzip ripple-demonstrator.zip

# Install the ewd-ripple middle tier

cd ~/ewd3
npm install ewd-client
cp ~/ewd3/node_modules/ewd-client/lib/proto/ewd-client.js ~/ewd3/www/ewd-client.js
npm install ewd-ripple

# Move the startup file into place

cp ~/ewd3/node_modules/ewd-ripple/example/ewd-xpress.js ~/ewd3/start-rippleosi-ewd3.js

# replace the Ripple UI's index.html with tweaked EWD3 version to establish an EWD Session

cp ~/ewd3/node_modules/ewd-ripple/www/index.html ~/ewd3/www/index.html

# Map port 80 to port 3000

sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

echo "----------------------------------------------------------------------------------"
echo " The set up of the EWD 3 Ripple Middle Tier on your Ubuntu server is now complete!"
echo "  Start it up using:                                                              "
echo "    cd ~/ewd3                                                                     "
echo "    node start-rippleosi-ewd3                                                     "
echo "----------------------------------------------------------------------------------"
