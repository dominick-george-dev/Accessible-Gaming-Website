output "floating_ip" {
  value = openstack_networking_floatingip_v2.floating_ip.address
  description = "The floating IP address assigned to the Jenkins server"
}

output "jenkins_url" {
  value = "http://${openstack_networking_floatingip_v2.floating_ip.address}:8080"
  description = "Jenkins web interface URL"
}

output "ssh_command" {
  value = "ssh -i cloud.key rocky@${openstack_networking_floatingip_v2.floating_ip.address}"
  description = "SSH command to connect to the Jenkins server"
}

output "password_command" {
  value = "ssh -i cloud.key rocky@${openstack_networking_floatingip_v2.floating_ip.address} 'sudo cat /var/lib/jenkins/secrets/initialAdminPassword'"
  description = "Command to retrieve Jenkins admin password"
}

output "deployment_info" {
  value = <<-EOT
  
  🚀 Jenkins Deployment Complete!
  ================================
  
  Jenkins URL: http://${openstack_networking_floatingip_v2.floating_ip.address}:8080
  SSH Access: ssh -i cloud.key rocky@${openstack_networking_floatingip_v2.floating_ip.address}
  
  Next Steps:
  1. Wait 5-10 minutes for Jenkins to fully initialize
  2. Get admin password with: ssh -i cloud.key rocky@${openstack_networking_floatingip_v2.floating_ip.address} 'sudo cat /var/lib/jenkins/secrets/initialAdminPassword'
  3. Access Jenkins and monitor the automatic build of 'team-6-accessibility-project'
  
  The pipeline will automatically:
  - Clone your repository
  - Install dependencies 
  - Run tests
  - Build Docker images
  - Deploy with docker-compose
  
  EOT
  description = "Complete deployment information"
}