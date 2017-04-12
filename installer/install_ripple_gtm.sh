#!/usr/bin/env bash

# run using: source install_ripple.sh

# Acknowledgement: Wladimir Mutel for NodeM configuration logic
#                  KS Bhaskar for GT.M installation logic

# run as normal user, eg ubuntu


# Prepare

echo 'Preparing environment'

sudo apt-get update
sudo apt-get install -y build-essential libssl-dev
sudo apt-get install -y wget gzip openssh-server curl python-minimal unzip

# GT.M

echo 'Installing GT.M'

mkdir /tmp/tmp # Create a temporary directory for the installer
cd /tmp/tmp    # and change to it. Next command is to download the GT.M installer
wget https://sourceforge.net/projects/fis-gtm/files/GT.M%20Installer/v0.13/gtminstall
chmod +x gtminstall # Make the file executable

# Thanks to KS Bhaskar for the following enhancement:

##sudo -E ./gtminstall --utf8 default --verbose # download and install GT.M including UTF-8 mode

gtmroot=/usr/lib/fis-gtm
gtmcurrent=$gtmroot/current
if [ -e "$gtmcurrent"] ; then
  mv -v $gtmcurrent $gtmroot/previous_`date -u +%Y-%m-%d:%H:%M:%S`
fi
sudo mkdir -p $gtmcurrent # make sure directory exists for links to current GT.M
sudo -E ./gtminstall --utf8 default --verbose --linkenv $gtmcurrent --linkexec $gtmcurrent # download and install GT.M including UTF-8 mode


echo 'Configuring GT.M'

# source "/usr/lib/fis-gtm/V6.3-000_x86_64"/gtmprofile
# echo 'source "/usr/lib/fis-gtm/V6.3-000_x86_64"/gtmprofile' >> ~/.profile

gtmprof=$gtmcurrent/gtmprofile
gtmprofcmd="source $gtmprof"
$gtmprofcmd
tmpfile=`mktemp`
if [ `grep -v "$gtmprofcmd" ~/.profile | grep $gtmroot >$tmpfile`] ; then
  echo "Warning: existing commands referencing $gtmroot in ~/.profile may interfere with setting up environment"
  cat $tmpfile
fi

# ****** Temporary fix to ensure that invocation of gtmprofile is added correctly to .profile

# if [ `grep -v "$gtmprofcmd" ~/.profile` ] ; then echo "$gtmprofcmd" >> ~/.profile ; fi

echo 'copying ' $gtmprofcmd ' to profile...'
echo $gtmprofcmd >> ~/.profile

# ****** end of temporary fix

rm $tmpfile
unset tmpfile gtmprofcmd gtmprof gtmcurrent gtmroot

echo 'GT.M has been installed and configured, ready for use'
echo 'Enter the GT.M shell by typing the command: gtm  Exit it by typing the command H'

# --- End of KS Bhaskar enhancement

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

# Retrieve the UI code
cd ~

# wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/develop/build/ripple-latest.zip?raw=true

wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/master/build/ripple-latest.zip?raw=true 

# Unpack the UI

unzip ripple_ui.zip

# move it into place

mv -v ~/dist/* ~/qewd/www/

# Map port 80 to port 3000
# sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

# echo "----------------------------------------------------------------------------------"
# echo " Port 80 will be permanently mapped to port 3000"
# echo "  Answer Yes to all questions that follow to make this happen...                  "
# echo "----------------------------------------------------------------------------------"

# sudo apt-get install iptables-persistent

# ========== Install nginx Proxy, listening on port 8086 =================

#  alias /var/www to the QEWD www directory

sudo ln -s ~/qewd/www/ /var/www
sudo apt-get install -y nginx
sudo cp ~/qewd/node_modules/qewd-ripple/nginx/sites-available/default /etc/nginx/sites-available/default
sudo systemctl restart nginx


echo "----------------------------------------------------------------------------------"
echo " The set up of the QEWD Ripple Middle Tier on your Ubuntu server is now complete!"
echo "  Startup template files (ripple-demo.js and ripple-secure.js                     "
echo "    are in the ~/qewd directory.  Add the appropriate Auth0 credentials           "
echo "                                                                                  "
echo "  eg:                                                                             "
echo "     cd ~/qewd                                                                    "
echo "     node ripple-demo                                                             "
echo "                                                                                  "
echo "  or use PM2 to run it as a service, eg:                                          "
echo "     cd ~/qewd                                                                    "
echo "     pm2 start ripple-demo.js                                                     "
echo "----------------------------------------------------------------------------------"

cd ~/qewd

