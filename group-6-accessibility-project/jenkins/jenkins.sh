#!/bin/bash

echo "cd to /root directory..."
cd /root

echo "whoami..."
whoami

echo "pwd..."
pwd

echo "upgrading..."
sudo dnf upgrade -y -q

echo "Install git"
sudo dnf install git -y

echo "Install Jenkins repo"
sudo curl -sL https://pkg.jenkins.io/redhat-stable/jenkins.repo -o /etc/yum.repos.d/jenkins.repo

echo "cd into /etc/yum.repos.d/"
cd /etc/yum.repos.d/

echo "Install Jenkins key"
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

echo "Install Jenkins"
sudo dnf install jenkins -y

echo "Start and enable Jenkins"
sudo systemctl enable jenkins
sudo systemctl start jenkins
echo "Jenkins status"
systemctl status jenkins

echo "Jenkins initial password"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

echo "Install unzip command"
sudo dnf install unzip -y

cd /root
echo "installing gitlab server key..."
touch .ssh/known_hosts
ssh-keyscan git.cardiff.ac.uk >> .ssh/known_hosts
chmod 644 .ssh/known_hosts

echo "Copy known host key into jenkins"
sudo mkdir /var/lib/jenkins/.ssh
cp /root/.ssh/known_hosts /var/lib/jenkins/.ssh
sudo chown -R jenkins:jenkins /var/lib/jenkins/.shh

echo "end of script..."