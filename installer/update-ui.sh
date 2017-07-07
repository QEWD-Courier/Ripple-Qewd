#!/usr/bin/env bash

# Update the PulseTile UI to the latest version

rm -r ~/qewd/www/assets
rm -r ~/qewd/www/videochat

cd ~
wget -O ripple_ui.zip https://github.com/PulseTile/PulseTile/blob/master/build/PulseTile-latest.zip?raw=true

# Unpack the UI

unzip ripple_ui.zip

# move it into place

mv -v ~/dist/* ~/qewd/www/

echo "PulseTile UI has been updated"
