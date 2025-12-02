#!/bin/bash

set -e

echo "=== Upgrading system and installing prerequisites ==="
dnf upgrade -y -q
dnf install -y git unzip curl

# Public key
PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFakePublicKeyHere user@host"

# Create .ssh directory
sudo mkdir -p /home/$USER/.ssh

# Add the public key to authorized_keys
echo $PUBKEY | sudo tee -a /home/$USER/.ssh/authorized_keys

# Set correct ownership and permissions
sudo chown -R $USER:$USER /home/$USER/.ssh
sudo chmod 700 /home/$USER/.ssh
sudo chmod 600 /home/$USER/.ssh/authorized_keys

echo "Public key added for user $USER"

echo "=== Installing Java 21 ==="
cd /opt
mkdir -p java
cd java
curl -sLO https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz
tar xvfz OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz
export PATH=/opt/java/jdk-21.0.6+7/bin:$PATH
export JAVA_HOME=/opt/java/jdk-21.0.6+7
java --version

echo "=== Installing Jenkins ==="
curl -sL https://pkg.jenkins.io/redhat-stable/jenkins.repo -o /etc/yum.repos.d/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
dnf install -y jenkins

echo "=== Setting up SSH keys for Jenkins user ==="
# Create Jenkins .ssh directory
sudo -u jenkins mkdir -p /var/lib/jenkins/.ssh
sudo chmod 700 /var/lib/jenkins/.ssh

# Copy private key (ensure cloud.key is present in /root)
if [ -f /root/cloud.key ]; then
    sudo cp /root/cloud.key /var/lib/jenkins/.ssh/id_rsa
    sudo chown jenkins:jenkins /var/lib/jenkins/.ssh/id_rsa
    sudo chmod 600 /var/lib/jenkins/.ssh/id_rsa
else
    echo "ERROR: /root/cloud.key not found. SSH setup skipped."
fi

# Add remote server to known_hosts to prevent SSH prompt
sudo -u jenkins ssh-keyscan -H 10.72.99.72 >> /var/lib/jenkins/.ssh/known_hosts
sudo chown jenkins:jenkins /var/lib/jenkins/.ssh/known_hosts
sudo chmod 644 /var/lib/jenkins/.ssh/known_hosts

echo "=== SSH setup complete ==="
echo "Jenkins can now SSH to rocky@10.72.99.72 using /var/lib/jenkins/.ssh/id_rsa"

systemctl enable jenkins
systemctl start jenkins
systemctl status jenkins --no-pager || true

# Wait a few seconds for Jenkins to generate initialAdminPassword
sleep 10
echo "Jenkins initial password:"
cat /var/lib/jenkins/secrets/initialAdminPassword || echo "Password not created yet"
