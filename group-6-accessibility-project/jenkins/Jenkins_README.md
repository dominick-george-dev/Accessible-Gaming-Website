# Jenkins CI/CD with Terraform and OpenStack README

## Pre-requisites
Ensure you have all of the following:
- Your OpenStack openrc.sh file e.g. c123456-openrc.sh (Unique for each user) and place it in the group-6-accessibility-project/jenkins.
- cloud.key - This is a private key which the user can find within the Teams. Under General/Files.
- Terraform is installed on your machine. Link to the installation instructions: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
- You MUST be on the university GlobalProtect VPN otherwise TERRAFORM WILL NOT WORK.

## How to Get Running (Start Guide)

1. Ensure that you are in the correct directory:
   ```powershell
   cd "c:\Users\c23069362\Documents\team-6-accessible-gaming-website\group-6-accessibility-project\jenkins"
   ```

2. Open a gitbash shell in the above directory.

3. Source your OpenRC file in the shell (only needed once per session):
   ```bash
   source ./c1414376-openrc.sh
   ```

4. Initialize Terraform:
   ```powershell
   terraform init
   ```

5. Create and apply the infrastructure:
   ```powershell
   terraform apply -auto-approve
   ```

6. Wait for deployment to complete (10-15 minutes)

7. In your git bash terminal, the ip address is presented. Access Jenkins at: `http://YOUR_FLOATING_IP:8080`

8. Open the instance within openstack. Instances >> Log >> View Full Log.
   - The admin password will be displayed in the VM console output under 
   ```
   JENKINS_PASSWORD=random_password
   ```

9. Copy and paste that into the initial admin password entry on the jenkins server page.

10. Click install suggested plugins and wait for them to download.

11. Create an admin account (all entries as "admin", email can be "admin@admin").

12. Leave the instance configuration as it is, press "Save & Continue" and then "Start using Jenkins".

13. From the dashboard, click on the settings icon top right then the plugins button.

14. Click on the available plugins tab and install the following plugins:
    - Pipeline Graph Analysis
    - Gitlab

15. Go back to the dashboard. Click New Item, then choose an appropriate name e.g. "main-pipeline" or "dev-pipeline" as examples. Then select Pipeline.

16. 

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

## 🎯 Next Steps After Deployment

1. **Access Jenkins**: http://YOUR_FLOATING_IP:8080
2. **Login**: Use admin/PASSWORD from deployment output
3. **Monitor Pipeline**: Check the "team-6-accessibility-project" job
4. **Verify Build**: Ensure the automatic build completes successfully
