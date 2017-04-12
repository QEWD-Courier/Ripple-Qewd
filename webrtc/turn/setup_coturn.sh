#!/bin/bash

echo 'deb http://http.us.debian.org/debian jessie main' | sudo tee /etc/apt/sources.list.d/coturn.list

gpg --keyserver pgpkeys.mit.edu --recv-key 8B48AD6246925553
gpg -a --export 8B48AD6246925553 | sudo apt-key add -

gpg --keyserver pgpkeys.mit.edu --recv-key 7638D0442B90D010
gpg -a --export 7638D0442B90D010 | sudo apt-key add -

gpg --keyserver pgpkeys.mit.edu --recv-key CBF8D6FD518E17E1
gpg -a --export CBF8D6FD518E17E1 | sudo apt-key add -

sudo apt-get update
sudo apt-get install coturn=4.2.1.2-1 -y

sudo cp -f ./turnserver.conf /etc/
sudo cp -f ./turnuserdb.conf /etc/
sudo cp -f ./coturn /etc/default

sudo service coturn start

