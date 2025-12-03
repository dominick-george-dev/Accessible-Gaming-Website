resource "openstack_networking_floatingip_v2" "floating_ip" {
  pool = var.pool
}

locals {
  env_file_content = fileexists("${path.module}/.env") ? file("${path.module}/.env") : ""
}


resource "openstack_compute_secgroup_v2" "security_group" {
  name        = "${var.security_name}-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  description = var.security_description
  rule {
    from_port   = 22
    to_port     = 22
    ip_protocol = "tcp"
    cidr        = "0.0.0.0/0"
  }
   rule {
      from_port   = 8080
      to_port     = 8081
      ip_protocol = "tcp"
      cidr        = "0.0.0.0/0"
    }
}

resource "openstack_compute_instance_v2" "instance" {
  name            = var.name
  image_name      = var.image
  flavor_name     = var.flavor
  security_groups = [openstack_compute_secgroup_v2.security_group.id]
  key_pair        = var.keypair
  user_data       = templatefile(var.server_script, {
    project_ssh_key = file("${path.module}/project.key")
    env_file_content = local.env_file_content
  })
}

resource "openstack_compute_floatingip_associate_v2" "floating_ip" {
  floating_ip = openstack_networking_floatingip_v2.floating_ip.address
  instance_id = openstack_compute_instance_v2.instance.id
}

# Save IP to a file that Jenkins can read
resource "local_file" "jenkins_env" {
  content = <<-EOT
FLOATING_IP=${openstack_networking_floatingip_v2.floating_ip.address}
VITE_API_URL=http://${openstack_networking_floatingip_v2.floating_ip.address}:3000
EOT
  filename = "${path.module}/jenkins-floating-ip.txt"
}

# Copy IP to Jenkins server
resource "null_resource" "copy_floating_ip" {
  depends_on = [
    openstack_compute_floatingip_associate_v2.floating_ip,
    local_file.jenkins_env
  ]

  provisioner "local-exec" {
    command = <<-EOT
      # Wait for Jenkins to be ready
      sleep 30
      
      # Copy the floating IP to Jenkins workspace
      scp -i ${path.module}/cloud.key -o StrictHostKeyChecking=no \
        ${path.module}/jenkins-floating-ip.txt \
        rocky@${openstack_networking_floatingip_v2.floating_ip.address}:/tmp/
      
      # Move it to Jenkins workspace and set permissions
      ssh -i ${path.module}/cloud.key -o StrictHostKeyChecking=no \
        rocky@${openstack_networking_floatingip_v2.floating_ip.address} \
        'sudo mkdir -p /var/lib/jenkins/workspace-env && \
         sudo cp /tmp/jenkins-floating-ip.txt /var/lib/jenkins/workspace-env/ && \
         sudo chown jenkins:jenkins /var/lib/jenkins/workspace-env/jenkins-floating-ip.txt'
    EOT
  }

  triggers = {
    floating_ip = openstack_networking_floatingip_v2.floating_ip.address
  }
}