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
  rule {
    from_port   = 3000
    to_port     = 3001
    ip_protocol = "tcp"
    cidr        = "0.0.0.0/0"
  }
}
 
resource "openstack_compute_instance_v2" "instance" {
  name            = var.name
  image_name      = var.image
  flavor_name     = var.flavor
  security_groups = [openstack_compute_secgroup_v2.security_group.name]  # Fixed: use .name
  key_pair        = var.keypair
  user_data       = templatefile(var.server_script, {
    project_ssh_key = file("${path.module}/project.key")
    env_file_content = local.env_file_content
  })
 
  lifecycle {
    ignore_changes = [security_groups]
  }
}
 
resource "openstack_compute_floatingip_associate_v2" "floating_ip" {
  floating_ip = openstack_networking_floatingip_v2.floating_ip.address
  instance_id = openstack_compute_instance_v2.instance.id
}
 
# Just save IP locally - Jenkins will auto-detect
resource "local_file" "jenkins_env" {
  content = <<-EOT
FLOATING_IP=${openstack_networking_floatingip_v2.floating_ip.address}
VITE_API_URL=http://${openstack_networking_floatingip_v2.floating_ip.address}:3000
EOT
  filename = "${path.module}/jenkins-floating-ip.txt"
}