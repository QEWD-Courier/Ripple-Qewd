#!/usr/bin/env bash

# Installs Ripple Middle Tier on Raspberry Pi
# run using: source install_ripple_rpi.sh
# run as normal user, eg pi

echo "-----------------------------------------------------------------------"
echo 'Preparing environment'
echo "-----------------------------------------------------------------------"

sudo apt-get update
sudo apt-get install -y build-essential libssl-dev
sudo apt-get install -y wget gzip openssh-server curl python-minimal unzip

# Install NVM

echo "-----------------------------------------------------------------------"
echo 'Installing NVM'
echo "-----------------------------------------------------------------------"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

command -v nvm

echo "NVM installed"

echo "-----------------------------------------------------------------------"
echo 'Installing Node.js'
echo "-----------------------------------------------------------------------"

nvm install 6

echo "Node.js installed:"
node -v

echo "-----------------------------------------------------------------------"
echo 'Installing QEWD and the Ripple Middle Tier components'
echo "-----------------------------------------------------------------------"

cd ~
mkdir qewd
cd qewd
npm install qewd-ripple ewd-client
npm install tcp-netx
npm install ewd-redis-globals

echo "-----------------------------------------------------------------------"
echo 'Moving qewd-ripple and QEWD files into place'
echo "-----------------------------------------------------------------------"

mv ~/qewd/node_modules/qewd-ripple/example/ripple-rpi.js ~/qewd/ripple-rpi.js

cd ~/qewd
mkdir www
cd www
mkdir qewd-monitor
mkdir qewd-content-store

cp ~/qewd/node_modules/qewd-monitor/www/bundle.js ~/qewd/www/qewd-monitor
cp ~/qewd/node_modules/qewd-monitor/www/*.html ~/qewd/www/qewd-monitor
cp ~/qewd/node_modules/qewd-monitor/www/*.css ~/qewd/www/qewd-monitor

cp ~/qewd/node_modules/qewd-content-store/www/bundle.js ~/qewd/www/qewd-content-store
cp ~/qewd/node_modules/qewd-content-store/www/*.html ~/qewd/www/qewd-content-store

cp ~/qewd/node_modules/ewd-client/lib/proto/ewd-client.js ~/qewd/www/ewd-client.js

# ============ WebRTC installation ========

# Server

cp -r ~/qewd/node_modules/qewd-ripple/webrtc/server/ ~/videochat-socket-server/
cp -r ~/qewd/node_modules/qewd-ripple/webrtc/ssl/ ~/qewd/ssl/
cd ~/videochat-socket-server
npm install
pm2 start pm2.json
pm2 save

# Client

# cp -r ~/qewd/node_modules/qewd-ripple/webrtc/client/ ~/qewd/www/videochat/
#   this is copied from the client s/w repository later

# TURN Server

# Optional - uncomment if needed
#  You'll also need to change the turnServer definition
#  at the top of ~/qewd/www/videochat/videochat.js

# cd ~/qewd/node_modules/qewd-ripple/webrtc/turn
# echo 'deb http://http.us.debian.org/debian jessie main' | sudo tee /etc/apt/sources.list.d/coturn.list
# gpg --keyserver pgpkeys.mit.edu --recv-key 8B48AD6246925553
# gpg -a --export 8B48AD6246925553 | sudo apt-key add -
# gpg --keyserver pgpkeys.mit.edu --recv-key 7638D0442B90D010
# gpg -a --export 7638D0442B90D010 | sudo apt-key add -
# gpg --keyserver pgpkeys.mit.edu --recv-key CBF8D6FD518E17E1
# gpg -a --export CBF8D6FD518E17E1 | sudo apt-key add -
# sudo apt-get update
# sudo apt-get install coturn=4.2.1.2-1 -y
# sudo cp -f ./turnserver.conf /etc/
# sudo cp -f ./turnuserdb.conf /etc/
# sudo cp -f ./coturn /etc/default
# sudo service coturn start

# ============  WebRTC installed ==========

echo "QEWD / Node.js and Ripple middle tier is now installed"

echo "-----------------------------------------------------------------------"
echo " Installing Redis..."
echo "-----------------------------------------------------------------------"

cd ~
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz

# rename the created redis directory to just redis

mv redis-stable redis
cd redis

# build Redis

echo "Building Redis - be patient, this will take some time!"

make
sudo make install
cd utils

echo "----------------------------------------------------------------------------------"
echo " Redis Server now being started"
echo "  Hit Enter to accept the default settings in the questions that follow...      "
echo "----------------------------------------------------------------------------------"

sudo ./install_server.sh

echo "Redis is now installed and running, listening on port 6379"

cd ~/qewd


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
echo "Fetching and installing the Ripple UI code"
echo "-----------------------------------------------------------------------"

cd ~

# wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/develop/build/ripple-latest.zip?raw=true

wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/master/build/ripple-latest.zip?raw=true
unzip ripple_ui.zip

# move the files into place

mv -v ~/dist/* ~/qewd/www/

# ========== Install nginx Proxy, listening on port 80 =================

#  alias /var/www to the QEWD www directory

sudo ln -s ~/qewd/www/ /var/www
sudo apt-get install -y nginx
sudo cp ~/qewd/node_modules/qewd-ripple/nginx/sites-available/default /etc/nginx/sites-available/default
sudo systemctl restart nginx

cd ~/qewd
pm2 start ripple-demo.js
pm2 start ripple-secure.js

echo "----------------------------------------------------------------------------------"
echo " The set up of the QEWD Ripple Middle Tier on your Raspberry Pi is now complete!  "
echo "  Startup template files (ripple-demo.js and ripple-secure.js                     "
echo "    are in the ~/qewd directory.  Add the appropriate Auth0 credentials           "
echo "                                                                                  "
echo "  ripple-demo and ripple-secure have been started in PM2 for you                  "
echo "----------------------------------------------------------------------------------"


