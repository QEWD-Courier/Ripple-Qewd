#!/usr/bin/env bash

# run using: source install_ripple.sh

# Acknowledgement: Wladimir Mutel for NodeM configuration logic
#                  KS Bhaskar for GT.M installation logic

# run as normal user, eg ubuntu

# 20 June 2017

# Prepare

echo 'Preparing environment'

sudo apt-get update
sudo apt-get install -y build-essential libssl-dev libelf1 dos2unix
sudo apt-get install -y wget gzip openssh-server curl python-minimal unzip

# YottaDB

echo 'Installing YottaDB'

mkdir /tmp/tmp # Create a temporary directory for the installer
cd /tmp/tmp    # and change to it. Next command is to download the YottaDB installer
wget  wget https://raw.githubusercontent.com/YottaDB/YottaDB/master/sr_unix/ydbinstall.sh -O gtminstall
chmod +x gtminstall # Make the file executable

gtmroot=/usr/lib/yottadb
gtmcurrent=$gtmroot/current
if [ -e "$gtmcurrent"] ; then
  mv -v $gtmcurrent $gtmroot/previous_`date -u +%Y-%m-%d:%H:%M:%S`
fi
sudo mkdir -p $gtmcurrent # make sure directory exists for links to current YottaDB
sudo -E ./gtminstall --utf8 default --verbose --linkenv $gtmcurrent --linkexec $gtmcurrent
echo 'Configuring YottaDB'

gtmprof=$gtmcurrent/gtmprofile
gtmprofcmd="source $gtmprof"
$gtmprofcmd
tmpfile=`mktemp`
if [ `grep -v "$gtmprofcmd" ~/.profile | grep $gtmroot >$tmpfile`] ; then
  echo "Warning: existing commands referencing $gtmroot in ~/.profile may interfere with setting up environment"
  cat $tmpfile
fi

echo 'copying ' $gtmprofcmd ' to profile...'
echo $gtmprofcmd >> ~/.profile

rm $tmpfile
unset tmpfile gtmprofcmd gtmprof gtmcurrent gtmroot

echo 'YottaDB has been installed and configured, ready for use'

# Node.js

echo 'Installing Node.js'

cd ~

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 6

#make Node.js available to sudo

sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm
sudo ln -s /usr/local/bin/node-waf /usr/bin/node-waf
n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local

# QEWD

echo 'Installing NodeM'

cd ~
mkdir qewd
cd qewd

# NodeM

echo 'Installing NodeM'

npm install nodem
sudo ln -sf $gtm_dist/libgtmshr.so /usr/local/lib/
sudo ldconfig
base=~/qewd
[ -f "$GTMCI" ] || export GTMCI="$(find $base -iname nodem.ci)"
nodemgtmr="$(find $base -iname v4wnode.m | tail -n1 | xargs dirname)"
echo "$gtmroutines" | fgrep "$nodemgtmr" || export gtmroutines="$nodemgtmr $gtmroutines"

echo 'base=~/qewd' >> ~/.profile
echo '[ -f "$GTMCI" ] || export GTMCI="$(find $base -iname nodem.ci)"' >> ~/.profile
echo 'nodemgtmr="$(find $base -iname v4wnode.m | tail -n1 | xargs dirname)"' >> ~/.profile
echo 'echo "$gtmroutines" | fgrep "$nodemgtmr" || export gtmroutines="$nodemgtmr $gtmroutines"' >> ~/.profile


# Install qewd-ripple (and its dependencies)

cd ~/qewd
npm install qewd-ripple ewd-client
sudo npm install -g pm2


echo 'Moving qewd-ripple and QEWD files into place'

mv ~/qewd/node_modules/qewd-ripple/example/ripple-demo.js ~/qewd/ripple-demo.js
mv ~/qewd/node_modules/qewd-ripple/example/ripple-secure.js ~/qewd/ripple-secure.js

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


echo "QEWD / Node.js middle tier is now installed"

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

# Run the database scripts

cd ~
mysql -u root -ppassword < ~/qewd/node_modules/qewd-ripple/data/create_database_and_tables.sql
mysql -u root -ppassword < ~/qewd/node_modules/qewd-ripple/data/populate_general_practitioners_table.sql
mysql -u root -ppassword < ~/qewd/node_modules/qewd-ripple/data/populate_medical_departments_table.sql
mysql -u root -ppassword < ~/qewd/node_modules/qewd-ripple/data/populate_patients_table.sql

echo "-----------------------------------------------------------------------"
echo " MySQL environment and data set up"
echo "-----------------------------------------------------------------------"


echo "-----------------------------------------------------------------------"
echo " Initialising deployment environment..."
echo "-----------------------------------------------------------------------"

# Retrieve the UI code

# To download the version of the UI that contains only core headings, please use the following link: 

#   https://github.com/PulseTile/PulseTile/blob/master/build/PulseTile-core-1.0.0.zip;
 
# In case you need a previous UI build - you'll see the builds available for downloading at:

#   https://github.com/PulseTile/PulseTile/blob/master/build/" 

cd ~
#
# If you want the latest development version: 
#   wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/develop/build/PulseTile-latest.zip?raw=true
#

wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/master/build/PulseTile-latest.zip?raw=true

# Unpack the UI

unzip ripple_ui.zip

# move it into place

mv -v ~/dist/* ~/qewd/www/


# Install Swagger UI and specification

cd ~/qewd/www
mkdir swagger
git clone https://github.com/swagger-api/swagger-ui.git
cp ~/qewd/node_modules/qewd-ripple/swagger/index.html ~/qewd/www/swagger-ui/dist
cp ~/qewd/node_modules/qewd-ripple/swagger/*.json ~/qewd/www/swagger
cp ~/qewd/node_modules/qewd-ripple/swagger/createSwaggerSpec.js ~/qewd


# Map port 80 to port 3000
# sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

# echo "----------------------------------------------------------------------------------"
# echo " Port 80 will be permanently mapped to port 3000"
# echo "  Answer Yes to all questions that follow to make this happen...                  "
# echo "----------------------------------------------------------------------------------"

# sudo apt-get install iptables-persistent

# ========== Install nginx Proxy, listening on ports 80 and 443 =================
# ==========   to ripple-demo and ripple-secure respectively    =================

#  alias /var/www to the QEWD www directory

sudo ln -s ~/qewd/www/ /var/www
sudo ln -s ~/qewd/ssl/ /var/ssl
sudo apt-get install -y nginx
sudo cp ~/qewd/node_modules/qewd-ripple/nginx/sites-available/default /etc/nginx/sites-available/default
sudo systemctl restart nginx

cd ~/qewd
pm2 start ripple-demo.js
pm2 start ripple-secure.js

echo "----------------------------------------------------------------------------------"
echo " The set up of the QEWD Ripple Middle Tier on your Ubuntu server is now complete! "
echo "  Startup template files (ripple-demo.js and ripple-secure.js                     "
echo "    are in the ~/qewd directory.  Add the appropriate Auth0 credentials           "
echo "                                                                                  "
echo "  ripple-demo and ripple-secure have been started in PM2 for you                  "
echo "----------------------------------------------------------------------------------"

