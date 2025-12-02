# Pre-requisites
Ensure you have all of the following:
    - Your Open stack openrc.sh file e.g. c123456-openrc.sh (Unique for each user) and place it in the group-6-accessibility-project/jenkins.
    - cloud.key - This is a private key which the user can find within the Teams. Under General/Files.
    - Terraform is installed on your machine. Link to the installation instructions can be found here: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
    - You MUST be on the university GlobalProtect VPN otherwise TERRAFORM WILL NOT WORK.

# Jenkins Plugins
Warnings plugin
GitLab plugin


# Pre-Build Steps

1. Ensure that you are in the correct directory. For example:
    /your/directory/structure/group-6-accessibility-project/jenkins

2. Source you OpenRC file (only need to run each shell session):
    source ./c1414376-openrc.sh

2. Initialise Terraform with this command:
    terraform init

3. Creates the project's Terraform configuration
    terraform plan

4. Apply terraform configuration to project infrastructure.
    terraform apply

    terraform destroy

# Build Shell Script




# Post-Build Task Shell Script



Job name:
blood-donation-project

Create Admin User:
username: admin
password: admin
full name: admin
email: admin@localhost

Webhook URL for triggering Jenkins build:
