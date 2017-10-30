#!/usr/bin/env bash

# run using: source update_ripple.sh

# run as normal user, eg ubuntu

# Update qewd-ripple (and its dependencies)

QEWD_DIR=$HOME/qewd-test

cd $QEWD_DIR

npm uninstall qewd-ripple
npm uninstall ewd-client
npm install qewd-ripple # ewd-client now a QEWD dependency

echo 'Moving qewd-ripple and QEWD files into place'

# mv $QEWD_DIR/node_modules/qewd-ripple/example/ripple-demo.js $QEWD_DIR/ripple-demo.js
# mv $QEWD_DIR/node_modules/qewd-ripple/example/ripple-secure.js $QEWD_DIR/ripple-secure.js

cd $QEWD_DIR/www

cp $QEWD_DIR/node_modules/qewd-monitor/www/bundle.js $QEWD_DIR/www/qewd-monitor
cp $QEWD_DIR/node_modules/qewd-monitor/www/*.html $QEWD_DIR/www/qewd-monitor
cp $QEWD_DIR/node_modules/qewd-monitor/www/*.css $QEWD_DIR/www/qewd-monitor

cp $QEWD_DIR/node_modules/qewd-content-store/www/bundle.js $QEWD_DIR/www/qewd-content-store
cp $QEWD_DIR/node_modules/qewd-content-store/www/*.html $QEWD_DIR/www/qewd-content-store

cp $QEWD_DIR/node_modules/ewd-client/lib/proto/ewd-client.js $QEWD_DIR/www/ewd-client.js

echo "QEWD / Node.js middle tier is now updated"

cd ~
mkdir ui-dist
cd ui-dist
mkdir angular

# Retrieve the UI code
cd ~

wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/master/build/PulseTile-latest.zip?raw=true

# Unpack the UI

unzip ripple_ui.zip

# move it into place

cp -v ~/dist/* $QEWD_DIR/www/
cp -v ~/dist/* ~/ui-dist/angular

echo "----------------------------------------------------------------------------------"
echo " The QEWD Ripple Middle Tier has been updated                                     "
echo "----------------------------------------------------------------------------------"


