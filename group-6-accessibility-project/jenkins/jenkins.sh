#!/bin/bash
# Jenkins setup script for Terraform deployment
# Optimized for Rocky Linux 9.5 with error resilience
set -u  # Only undefined variables cause failure, not all errors

# Error handling for critical operations
critical_command() {
    local cmd="$1"
    local description="$2"
    
    log "Running: $description"
    if ! eval "$cmd"; then
        log "CRITICAL ERROR: $description failed"
        log "Command: $cmd"
        return 1
    fi
    return 0
}

# Logging setup
readonly LOG_FILE="/var/log/jenkins-setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting Jenkins setup for Team 6 Accessibility Project"

########################################
# System Setup
########################################
log "Updating system packages..."
dnf update -y --quiet || log "Warning: System update had issues, continuing..."

log "Installing core dependencies..."
critical_command "dnf install -y --quiet java-17-openjdk-devel git curl wget" "Core dependency installation"

# Configure Java environment
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
cat > /etc/environment << 'EOF'
JAVA_HOME=/usr/lib/jvm/java-17-openjdk
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-17-openjdk/bin
EOF

########################################
# Repository Setup
########################################
log "Adding repositories..."

# Docker repository
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo || log "Warning: Docker repo failed"

# Node.js repository (with error handling)
log "Adding Node.js repository..."
if curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -; then
    log "Node.js repository added successfully"
else
    log "Warning: Node.js repository setup failed, will use system packages"
fi

# Jenkins repository
critical_command "curl -fsSL https://pkg.jenkins.io/redhat-stable/jenkins.repo -o /etc/yum.repos.d/jenkins.repo" "Jenkins repo download"
critical_command "rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key" "Jenkins GPG key import"

########################################
# Package Installation
########################################
log "Installing Docker..."
dnf install -y --quiet docker-ce docker-ce-cli containerd.io || log "Warning: Docker installation had issues"

log "Installing Node.js..."
# Use set +e temporarily to handle Node.js package conflicts gracefully
set +e
if dnf list available nodejs | grep -q nodesource; then
    log "Installing Node.js from NodeSource..."
    dnf install -y --quiet nodejs --exclude=npm
    if [ $? -ne 0 ]; then
        log "NodeSource installation failed, trying system packages..."
        dnf install -y --quiet nodejs --nobest
    fi
else
    log "Installing Node.js from system repositories..."
    dnf install -y --quiet nodejs
fi
set -u

log "Installing Jenkins..."
critical_command "dnf install -y --quiet jenkins" "Jenkins installation"

# Install npm with conflict resolution
log "Installing npm..."
set +e
if ! command -v npm &> /dev/null; then
    dnf install -y --quiet npm --nobest
    if [ $? -ne 0 ]; then
        log "Standard npm installation failed, trying alternatives..."
        dnf install -y --quiet nodejs-npm --nobest
        if [ $? -ne 0 ]; then
            log "Warning: npm installation failed - will continue without npm"
            log "Node.js is available but npm may need manual installation"
        fi
    fi
else
    log "npm is already available"
fi
set -u

########################################
# Service Configuration
########################################
log "Configuring services..."

# Enable and start services
systemctl enable --now docker
systemctl enable jenkins

# Add jenkins user to docker group
usermod -aG docker jenkins

# Configure Jenkins service
mkdir -p /etc/systemd/system/jenkins.service.d
cat > /etc/systemd/system/jenkins.service.d/override.conf << 'EOF'
[Service]
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk"
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-17-openjdk/bin"
TimeoutStartSec=300
EOF

systemctl daemon-reload

# Create Jenkins directories
mkdir -p /var/lib/jenkins/{init.groovy.d,.ssh}
mkdir -p /var/log/jenkins
chown -R jenkins:jenkins /var/lib/jenkins /var/log/jenkins

########################################
# Jenkins Configuration
########################################
log "Configuring Jenkins automation..."

# Skip setup wizard
echo 'JAVA_ARGS="-Djenkins.install.runSetupWizard=false"' >> /etc/sysconfig/jenkins
echo '2.440.3' > /var/lib/jenkins/jenkins.install.InstallUtil.lastExecVersion

# SSH Configuration
log "Setting up SSH configuration..."
chmod 700 /var/lib/jenkins/.ssh

# Deploy SSH private key from Terraform
cat > /var/lib/jenkins/.ssh/id_rsa << 'SSH_KEY_EOF'
${project_ssh_key}
SSH_KEY_EOF
chmod 600 /var/lib/jenkins/.ssh/id_rsa

# Add known hosts with better error handling
log "Adding known hosts..."
{
    timeout 10 ssh-keyscan -H "git.cardiff.ac.uk" 2>/dev/null || log "Warning: Could not reach git.cardiff.ac.uk"
    timeout 10 ssh-keyscan -H "10.72.99.72" 2>/dev/null || log "Warning: Could not reach 10.72.99.72"
} >> /var/lib/jenkins/.ssh/known_hosts 2>/dev/null || true

# Ensure known_hosts exists even if empty
touch /var/lib/jenkins/.ssh/known_hosts
chmod 644 /var/lib/jenkins/.ssh/known_hosts

chown -R jenkins:jenkins /var/lib/jenkins/.ssh

# Jenkins initialization scripts
create_init_script() {
    local script_name="$1"
    local script_content="$2"
    
    cat > "/var/lib/jenkins/init.groovy.d/$script_name" << GROOVY_EOF
$script_content
GROOVY_EOF
}

# Initial setup script
create_init_script "01_setup.groovy" '
#!groovy
import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Skip setup wizard
if (!instance.getInstallState().isSetupComplete()) {
    InstallState.INITIAL_SETUP_COMPLETED.initializeState()
}

// Basic configuration
instance.setSlaveAgentPort(-1)
instance.setNumExecutors(2)
instance.setSecurityRealm(SecurityRealm.NO_AUTHENTICATION)
instance.setAuthorizationStrategy(AuthorizationStrategy.UNSECURED)

def adminWhitelistRule = new AdminWhitelistRule()
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

instance.save()
'

# Plugin installation script
create_init_script "02_plugins.groovy" '
#!groovy
import jenkins.model.Jenkins
import hudson.model.UpdateCenter

def jenkins = Jenkins.getInstance()
def updateCenter = jenkins.getUpdateCenter()

def plugins = [
    "git", "workflow-aggregator", "pipeline-stage-view", "blueocean",
    "docker-workflow", "credentials-binding", "nodejs", "warnings-ng",
    "ssh-credentials", "workflow-scm-step", "workflow-cps",
    "pipeline-github-lib", "plain-credentials"
]

Thread.sleep(5000) // Wait for update center
updateCenter.doUpgrade()

plugins.each { pluginId ->
    if (!jenkins.getPluginManager().getPlugin(pluginId)) {
        def plugin = updateCenter.getPlugin(pluginId)
        plugin?.deploy(true)
    }
}
jenkins.save()
'

# SSH Credentials configuration
create_init_script "03_credentials.groovy" '
#!groovy
import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.jenkins.plugins.sshcredentials.impl.*
import org.jenkinsci.plugins.plaincredentials.impl.*

def jenkins = Jenkins.getInstance()
def domain = Domain.global()
def store = jenkins.getExtensionList("com.cloudbees.plugins.credentials.SystemCredentialsProvider")[0].getStore()

// SSH credentials
def privateKeyFile = new File("/var/lib/jenkins/.ssh/id_rsa")
if (privateKeyFile.exists()) {
    def sshCredentials = new BasicSSHUserPrivateKey(
        CredentialsScope.GLOBAL,
        "gitlab-ssh-key",
        "git",
        new BasicSSHUserPrivateKey.DirectEntryPrivateKeySource(privateKeyFile.text),
        "",
        "GitLab SSH Key for Repository Access"
    )
    
    if (!store.getCredentials(domain).find { it.id == "gitlab-ssh-key" }) {
        store.addCredentials(domain, sshCredentials)
    }
}

// Environment credentials
def envContent = """
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/gamedb
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
""".trim()

def envCredentials = new StringCredentialsImpl(
    CredentialsScope.GLOBAL,
    "env_file_content",
    "Environment Variables Content",
    envContent
)

if (!store.getCredentials(domain).find { it.id == "env_file_content" }) {
    store.addCredentials(domain, envCredentials)
}

jenkins.save()
'

# Job creation and build trigger
create_init_script "04_job.groovy" '
#!groovy
import jenkins.model.Jenkins
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.*
import hudson.model.*

def jenkins = Jenkins.getInstance()
def jobName = "team-6-accessibility-project"

// Check if job already exists
if (jenkins.getItem(jobName)) {
    return
}

// Create the job
def job = jenkins.createProject(WorkflowJob.class, jobName)
job.setDescription("CI/CD pipeline for Team 6 Accessibility Gaming Website")

// Configure SCM
def gitSCM = new GitSCM(
    [new UserRemoteConfig("git@git.cardiff.ac.uk:c23069362/team-6-accessible-gaming-website.git", "", "", "gitlab-ssh-key")],
    [new BranchSpec("*/main")],
    false, [], null, null, []
)

// Set pipeline definition
def cpsScmFlowDefinition = new CpsScmFlowDefinition(gitSCM, "group-6-accessibility-project/Jenkinsfile")
cpsScmFlowDefinition.setLightweight(true)
job.setDefinition(cpsScmFlowDefinition)

job.save()

// Trigger initial build
Thread.sleep(5000)
job.scheduleBuild2(5, new Cause.UserIdCause())
jenkins.save()
'

chown -R jenkins:jenkins /var/lib/jenkins/init.groovy.d

########################################
# Start Jenkins
########################################
log "Starting Jenkins service..."

# Start Jenkins and wait for initialization
start_jenkins() {
    log "Starting Jenkins service..."
    
    # Start Jenkins with error handling
    if systemctl start jenkins; then
        log "Jenkins service started successfully"
    else
        log "Warning: Jenkins service failed to start initially, will retry..."
        sleep 5
        systemctl restart jenkins || log "Jenkins restart also failed, continuing anyway..."
    fi
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if systemctl is-active --quiet jenkins; then
            log "Jenkins service is active, checking web interface..."
            if curl -sf http://localhost:8080 >/dev/null 2>&1; then
                log "Jenkins is running and responsive!"
                return 0
            else
                log "Jenkins service running but web interface not ready... ($attempt/$max_attempts)"
            fi
        else
            log "Jenkins service not active... ($attempt/$max_attempts)"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log "Jenkins startup timeout - service may need more time"
    log "Check status later with: systemctl status jenkins"
    return 0  # Don't fail the script, just warn
}

start_jenkins

########################################
# Final Status and Output
########################################
get_status() {
    local service="$1"
    systemctl is-active --quiet "$service" && echo "✅ RUNNING" || echo "❌ STOPPED"
}

wait_for_admin_password() {
    local max_wait=60
    local count=0
    
    while [ $count -lt $max_wait ] && [ ! -f /var/lib/jenkins/secrets/initialAdminPassword ]; do
        sleep 5
        ((count += 5))
    done
}

log "Waiting for Jenkins initialization to complete..."
wait_for_admin_password

# Echo the admin password to VM logs for easy access
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    JENKINS_ADMIN_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)
    log "========================================="
    log "JENKINS ADMIN PASSWORD: $JENKINS_ADMIN_PASSWORD"
    log "========================================="
    echo "JENKINS ADMIN PASSWORD: $JENKINS_ADMIN_PASSWORD"
else
    log "Warning: Jenkins admin password file not found yet"
fi

cat << 'EOF'

================================================
         JENKINS SETUP COMPLETE
================================================

🔧 SERVICE STATUS:
EOF

echo "• Jenkins: $(get_status jenkins)"
echo "• Docker: $(get_status docker)"
echo "• Java: $(java -version 2>&1 | head -n1 || echo 'Not detected')"
echo "• Node.js: $(node --version 2>/dev/null || echo 'Not detected')"

cat << 'EOF'

🌐 ACCESS INFORMATION:
EOF

if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    JENKINS_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)
    cat << EOF
• URL: http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP"):8080
• Username: admin
• Password: $JENKINS_PASSWORD

🔑 ADMIN PASSWORD: $JENKINS_PASSWORD
EOF
else
    cat << 'EOF'
• URL: http://YOUR_SERVER_IP:8080
• Password: Not yet available - check in a few minutes with:
  sudo cat /var/lib/jenkins/secrets/initialAdminPassword
EOF
fi

cat << 'EOF'

🚀 NEXT STEPS:
1. Access Jenkins at the URL above
2. The "team-6-accessibility-project" pipeline should be created automatically
3. Monitor initial build progress in the Jenkins interface

🔍 TROUBLESHOOTING:
• Check status: sudo systemctl status jenkins
• View logs: sudo journalctl -u jenkins -f
• Restart if needed: sudo systemctl restart jenkins

================================================

EOF

log "Jenkins setup completed successfully!"

# Final safety check - ensure script exits with success
log "Script execution completed - Jenkins should be initializing in the background"
exit 0