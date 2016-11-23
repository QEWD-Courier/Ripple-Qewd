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

# ewd-xpress

echo 'Installing NodeM'

cd ~
mkdir ewd3
cd ewd3

# NodeM

echo 'Installing NodeM'

npm install nodem
sudo ln -sf $gtm_dist/libgtmshr.so /usr/local/lib/
sudo ldconfig
base=~/ewd3
[ -f "$GTMCI" ] || export GTMCI="$(find $base -iname nodem.ci)"
nodemgtmr="$(find $base -iname v4wnode.m | tail -n1 | xargs dirname)"
echo "$gtmroutines" | fgrep "$nodemgtmr" || export gtmroutines="$nodemgtmr $gtmroutines"

echo 'base=~/ewd3' >> ~/.profile
echo '[ -f "$GTMCI" ] || export GTMCI="$(find $base -iname nodem.ci)"' >> ~/.profile
echo 'nodemgtmr="$(find $base -iname v4wnode.m | tail -n1 | xargs dirname)"' >> ~/.profile
echo 'echo "$gtmroutines" | fgrep "$nodemgtmr" || export gtmroutines="$nodemgtmr $gtmroutines"' >> ~/.profile


# Install ewd-ripple (and its dependencies)

cd ~/ewd3
npm install ewd-ripple ewd-client
sudo npm install -g pm2


echo 'Moving ewd-ripple and ewd-express files into place'

mv ~/ewd3/node_modules/ewd-ripple/example/ripple-demo.js ~/ewd3/ripple-demo.js
mv ~/ewd3/node_modules/ewd-ripple/example/ripple-secure.js ~/ewd3/ripple-secure.js

cd ~/ewd3
mkdir www
cd www
mkdir ewd-xpress-monitor
cp ~/ewd3/node_modules/ewd-xpress-monitor/www/bundle.js ~/ewd3/www/ewd-xpress-monitor
cp ~/ewd3/node_modules/ewd-xpress-monitor/www/*.html ~/ewd3/www/ewd-xpress-monitor
cp ~/ewd3/node_modules/ewd-xpress-monitor/www/*.css ~/ewd3/www/ewd-xpress-monitor
cp ~/ewd3/node_modules/ewd-client/lib/proto/ewd-client.js ~/ewd3/www/ewd-client.js

echo "EWD 3 / Node.js middle tier is now installed"

cd ~/ewd3


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

wget https://github.com/RippleOSI/Org-Ripple-UI-rf3/raw/develop/build/ripple_latest.zip

# Unpack the UI

unzip rippleui-1.1.1.zip

# move it into place

mv -v ~/dist/* ~/ewd3/www/

# Map port 80 to port 3000

sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

echo "----------------------------------------------------------------------------------"
echo " The set up of the EWD 3 Ripple Middle Tier on your Ubuntu server is now complete!"
echo "  Startup template files (ripple-demo.js and ripple-secure.js                     "
echo "    are in the ~/ewd3 directory.  Add the appropriate Auth0 credentials           "
echo "----------------------------------------------------------------------------------"

cd ~/ewd3

