#!/bin/bash
set -euxo pipefail

LOG="/var/log/user-data.log"
exec > >(tee -a $LOG | logger -t user-data ) 2>&1

echo "Starting Jenkins setup..."

########################################
# System Update
########################################
echo "Updating system..."
dnf upgrade -y || true

########################################
# Install Dependencies (including Java)
########################################
echo "Installing dependencies..."
dnf install -y git unzip curl wget || true

echo "Installing Java (required for Jenkins)..."
dnf install -y java-17-openjdk-devel || true

########################################
# Install Jenkins Repo + Key
########################################
echo "Adding Jenkins repo..."
curl -fsSL https://pkg.jenkins.io/redhat-stable/jenkins.repo -o /etc/yum.repos.d/jenkins.repo || true
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key || true

########################################
# Install Jenkins
########################################
echo "Installing Jenkins..."
dnf install -y jenkins || true

########################################
# Configure Jenkins
########################################
echo "Configuring Jenkins..."
# Set JAVA_HOME for Jenkins
echo 'JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> /etc/environment
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# Create Jenkins directories with proper ownership
mkdir -p /var/lib/jenkins
chown -R jenkins:jenkins /var/lib/jenkins

########################################
# Enable + Start Jenkins
########################################
echo "Enabling and starting Jenkins..."
systemctl enable jenkins

# Wait a moment before starting
sleep 5

# Start Jenkins and wait for it to be ready
echo "Starting Jenkins service..."
systemctl start jenkins

# Wait for Jenkins to start up (it takes time on first run)
echo "Waiting for Jenkins to start up..."
for i in {1..60}; do
    if systemctl is-active --quiet jenkins; then
        echo "Jenkins is running."
        break
    fi
    echo "Waiting for Jenkins to start... ($i/60)"
    sleep 10
done

# Check if Jenkins is actually running
if ! systemctl is-active --quiet jenkins; then
    echo "Jenkins failed to start. Checking status..."
    systemctl status jenkins || true
    journalctl -u jenkins --no-pager || true
fi

########################################
# Jenkins SSH Directory
########################################
echo "Preparing Jenkins SSH directory..."
mkdir -p /var/lib/jenkins/.ssh
chmod 700 /var/lib/jenkins/.ssh
chown -R jenkins:jenkins /var/lib/jenkins/.ssh

########################################
# Optional: Install GitLab Host Key
########################################
GITLAB_HOST="git.cardiff.ac.uk"

echo "Adding GitLab host key (non-fatal)..."
ssh-keyscan -T 5 -H "$GITLAB_HOST" >> /var/lib/jenkins/.ssh/known_hosts 2>/dev/null || \
  echo "# ssh-keyscan failed for $GITLAB_HOST" >> /var/lib/jenkins/.ssh/known_hosts

chmod 644 /var/lib/jenkins/.ssh/known_hosts
chown jenkins:jenkins /var/lib/jenkins/.ssh/known_hosts

########################################
# Optional: Add a public key for SSH to servers
########################################
# Replace this with your actual public key if needed
# PUBKEY="ssh-ed25519 AAAA....your-actual-key-here"

echo "Skipping SSH public key setup (placeholder key detected)..."
# Uncomment and replace with real key when needed:
# echo "$PUBKEY" >> /var/lib/jenkins/.ssh/authorized_keys
# chmod 600 /var/lib/jenkins/.ssh/authorized_keys
# chown jenkins:jenkins /var/lib/jenkins/.ssh/authorized_keys

########################################
# Safe ssh-keyscan to a compute server
########################################
TARGET_SERVER="10.72.99.72"
echo "Attempting to add $TARGET_SERVER to known_hosts..."

for i in {1..10}; do
    if ssh-keyscan -T 5 -H "$TARGET_SERVER" >> /var/lib/jenkins/.ssh/known_hosts 2>/dev/null; then
        echo "Added $TARGET_SERVER to known_hosts."
        break
    fi
    echo "Attempt $i failed. Retrying in 5 seconds..."
    sleep 5
done

# Avoid cloud-init failure
echo "# Completed ssh-keyscan block" >> /var/lib/jenkins/.ssh/known_hosts

########################################
# Final status
########################################
echo "Checking Jenkins status..."
systemctl status jenkins --no-pager || true

echo "Jenkins initial password (if available):"
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    cat /var/lib/jenkins/secrets/initialAdminPassword
else
    echo "Initial password file not found. Jenkins may need more time to start."
fi

echo "Jenkins should be accessible at: http://YOUR_SERVER_IP:8080"

# Wait for Jenkins to fully initialize and create the admin password
echo "Waiting for Jenkins to fully initialize and generate admin password..."
for i in {1..60}; do
    if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
        echo "Jenkins admin password file found after $((i * 10)) seconds!"
        break
    fi
    echo "Waiting for password file... ($i/60) - checking every 10 seconds"
    sleep 10
done

# Final Jenkins status and password display
echo ""
echo "=========================================="
echo "          JENKINS SETUP COMPLETE"
echo "=========================================="

if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    echo ""
    echo "🔑 JENKINS INITIAL ADMIN PASSWORD:"
    echo "-----------------------------------"
    JENKINS_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)
    echo "$JENKINS_PASSWORD"
    echo "-----------------------------------"
    echo ""
    echo "📋 ACCESS DETAILS:"
    echo "• URL: http://YOUR_FLOATING_IP:8080"
    echo "• Username: admin"
    echo "• Password: $JENKINS_PASSWORD"
    echo ""
else
    echo "❌ Warning: Admin password file not found after 10 minutes."
    echo "Jenkins may still be initializing. Check manually with:"
    echo "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
fi

# Display final system information
echo "SYSTEM STATUS:"
echo "• Jenkins Service: $(systemctl is-active jenkins)"
echo "• Java Version: $(java -version 2>&1 | head -n 1 || echo 'Not found')"
echo "• Server Time: $(date)"
echo ""
echo "=========================================="
echo "User-data script finished successfully."
echo "=========================================="
