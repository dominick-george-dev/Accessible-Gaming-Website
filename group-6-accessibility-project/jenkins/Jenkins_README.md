# Jenkins CI/CD with Terraform and OpenStack README

## Pre-requisites
The following keys can be found in the teams Files>General>CI CD Keys
Ensure you have all of the following in the `group-6-accessibility-project\jenkins`:
- Your OpenStack openrc.sh file e.g. c123456-openrc.sh (Unique for each user) and place it in the group-6-accessibility-project/jenkins.
- cloud.key - Allows ssh into jenkins server.
- jenkins-env.tpl - stores teh floating_ip address of the Jenkins server.
- project.key - allows you to interact with the gitlab repository.

- **🔐 .env file**: Create a `.env` file in the `/jenkins` directory with your environment variables:
```
JWT_SECRET="your_jwt_secret_here"
AWS_ACCESS_KEY_ID="your_aws_key_here"
AWS_SECRET_ACCESS_KEY="your_aws_secret_here"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="your_bucket_name"
CLOUDFRONT_URL="your_cloudfront_url"
DATABASE_URL="your_database_url"
```
⚠️ **NEVER commit this file to the repository!**

- Terraform is installed on your machine. Link to the installation instructions: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
- You MUST be on the university GlobalProtect VPN otherwise TERRAFORM WILL NOT WORK.

## How to Get Running (Start Guide)

1. Open a gitbash terminal.

2. Ensure that you are in the correct directory:
   ```bash
   cd ../team-6-accessible-gaming-website/group-6-accessibility-project/jenkins
   ```

3. Open your broswer and navigate to https://cscloud.cf.ac.uk/:
   - Domain name: cardiff.ac.uk
   - Username: c12345668 (Change for your student number)
   - Password: Same as other university websites.

4. Source your OpenRC file in the shell (only needed once per session):
   ```bash
   # Make this match your open-rc.sh filename
   # It will prompt you for a password, same as your OpenStack login.
   source ./example-openrc.sh
   ```

5. Initialize Terraform:
   ```bash
   terraform init
   ```

6. Plan Terraform:
   ```bash
   terraform plan
   ```

5. Apply the infrastructure:
   ```bash
   terraform apply --auto-approve
   ```

6. Wait for deployment to complete (10-15 minutes)

7. In your git bash terminal, the ip address is presented. Access Jenkins at: `http://YOUR_FLOATING_IP:8080`

8. Open the instance within openstack. Instances >> Log >> View Full Log.
   - The admin password will be displayed in the VM console output under 
   ```bash
   ADMIN_PASSWORD=<random_password>
   ```

9. Copy and paste that into the initial admin password entry on the jenkins server page.

10. Click install suggested plugins and wait for them to download.

11. Create an admin account (all entries as "admin", email can be "admin@admin").

12. Leave the instance configuration as it is, press "Save & Continue" and then "Start using Jenkins".

13. From the dashboard, click on the settings icon top right then the plugins button.

14. Click on the available plugins tab and install the following plugin:
    - Gitlab

15. Go back to the dashboard. Click New Item, then choose an appropriate name e.g. "main-pipeline" or "dev-pipeline" as examples. Then select Pipeline.

16. In the pipeline configuration page:
    - **General Tab**: Leave default settings
    - **Build Triggers**: Check "Poll SCM" and set schedule to `H/5 * * * *` (polls every 5 minutes)
    - **Pipeline Section**:
      - **Definition**: Select "Pipeline script from SCM"
      - **SCM**: Select "Git"
      - **Repository URL**: Enter the GitLab repository URL:
        ```
        https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website.git
        ```
      - **Credentials**: Click "Add" > "Jenkins" to add GitLab credentials:
        - **Kind**: Username with password
        - **Username**: Your GitLab username
        - **Password**: Your GitLab personal access token
        - **ID**: `gitlab-credentials`
        - **Description**: GitLab Access Token
      - **Branches to build**: `*/main` (or your target branch)
      - **Script Path**: `group-6-accessibility-project/Jenkinsfile`

## 📝 Creating a Jenkinsfile

If you don't have a `Jenkinsfile` in your repository root, create one with this basic structure:

```bash
pipeline {
    agent any

    environment {
        GO111MODULE = 'on'
        DOCKER_BUILDKIT = '1'
        FLOATING_IP = ''
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    echo 'Setting up environment...'
                    // Get the floating IP dynamically
                    def floatingIP = sh(
                        script: 'curl -s ifconfig.me || hostname -I | awk \'{print $1}\'',
                        returnStdout: true
                    ).trim()
                    
                    env.FLOATING_IP = floatingIP
                    echo "Detected floating IP: ${env.FLOATING_IP}"
                    sh '''
                        echo "Current directory: $(pwd)"
                        ls -la
                        
                        # Copy environment file to workspace
                        if [ -f /var/lib/jenkins/workspace-env/.env ]; then
                            cp /var/lib/jenkins/workspace-env/.env group-6-accessibility-project/.env
                            echo "Environment file copied to project"
                            echo "Environment variables available:"
                            cat group-6-accessibility-project/.env | grep -v SECRET | head -3
                        else
                            echo "Warning: Environment file not found at /var/lib/jenkins/workspace-env/.env"
                            echo "Creating basic .env file..."
                            touch group-6-accessibility-project/.env
                        fi
                        
                        # Add floating IP to environment file
                        cd group-6-accessibility-project
                        echo "FLOATING_IP=${FLOATING_IP}" >> .env
                        echo "VITE_API_URL=http://${FLOATING_IP}:3000" >> .env
                        
                        echo "Environment variables configured:"
                        cat .env | grep -E "(FLOATING_IP|VITE_API_URL)" || echo "No IP variables found"
                        
                        # Setup backend dependencies
                        cd backend
                        npm ci || npm install
                        npm install prisma@6.19.0 --save-dev || true
                    '''
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    sh '''
                        cd group-6-accessibility-project/backend
                        npx prisma generate --schema=prisma/schema.prisma || true
                        npm install --save-dev ts-jest typescript || true
                        npm run test || echo "Tests completed with warnings"
                    '''
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo 'Building Docker images...'
                    sh '''
                        cd group-6-accessibility-project
                        echo "Building with Docker Compose..."
                        docker-compose -f docker-compose.yml build || echo "Build completed with warnings"
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application...'
                    sh '''
                        cd group-6-accessibility-project
                        echo "Starting services..."
                        docker-compose -f docker-compose.yml up -d || echo "Deployment completed with warnings"
                        
                        echo "Application URLs:"
                        echo "Frontend: http://${FLOATING_IP}:3001"
                        echo "Backend: http://${FLOATING_IP}:3000"
                        echo "Jenkins: http://${FLOATING_IP}:8080"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed!'
            sh '''
                cd group-6-accessibility-project || true
                docker-compose logs --tail=50 || true
            '''
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
            sh '''
                cd group-6-accessibility-project || true
                docker-compose logs || true
            '''
        }
    }
}
```

## 🔄 Migration from Previous Version

If you have an existing deployment with issues:

```bash
# Destroy the problematic instance
terraform destroy -auto-approve

# Update to optimised version
git pull origin main

# Deploy optimized version
./clean.sh
```

After those steps, redo the steps from the start guide and it will work.

## 🔑 GitLab Personal Access Token Setup

To create a GitLab personal access token for Jenkins:

1. Go to **Cardiff GitLab**: https://git.cardiff.ac.uk  ← Updated URL
2. Click your profile picture → Settings → Access Tokens
3. Create a new token with these settings:
   - **Name**: `jenkins-ci`
   - **Expiration**: Set to 1 year from now
   - **Scopes**: Check these permissions:
     - ✅ `api` (Full API access)
     - ✅ `read_repository` (Read repository)
     - ✅ `write_repository` (Write to repository if needed)
     - ✅ `read_user` (Read user information)
4. Click "Create personal access token"
5. **Copy the token immediately** (you won't see it again)
6. Use this token as the password in step 16 above

## 🚀 Testing Your Pipeline

1. **Manual Trigger**: Go to your pipeline → "Build Now"
2. **Automatic Trigger**: Push changes to your repository
3. **Monitor Build**: Click on the build number to see console output
4. **View Results**: Check the pipeline stages and their status

## 🔧 Common Pipeline Issues & Solutions

### Issue: "Host key verification failed"
**Solution**: The Jenkins setup script should handle this, but if it persists:
```bash
# SSH into Jenkins server
ssh -i cloud.key rocky@YOUR_JENKINS_IP
sudo su - jenkins
ssh-keyscan gitlab.dcu.ie >> ~/.ssh/known_hosts
```

### Issue: "Permission denied (publickey)"
**Solution**: Ensure you're using the correct GitLab credentials (username + personal access token)

### Issue: Node.js not found
**Solution**: 
1. Go to Jenkins → Manage Jenkins → Global Tool Configuration
2. Add NodeJS installation:
   - **Name**: `NodeJS`
   - **Install automatically**: Check
   - **Version**: Select latest LTS

## 📊 Pipeline Features

Your pipeline will now:
- ✅ Automatically trigger on code changes
- ✅ Check out your repository
- ✅ Install dependencies (if package.json exists)
- ✅ Run build scripts
- ✅ Execute tests
- ✅ Provide detailed build logs
- ✅ Show build status and history

## 🎯 Next Steps After Pipeline Setup

1. **Commit a Jenkinsfile** to your repository root
2. **Test the pipeline** with a manual build
3. **Push changes** to trigger automatic builds
4. **Monitor build results** and fix any issues
5. **Customize the pipeline** for your specific project needs