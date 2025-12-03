variable "flavor" { default = "m1.large" }
variable "image" { default = "Rocky 9.5 20241118" }
variable "name" { default = "Jenkins-Pipeline" }
variable "keypair" { default = "cloud" }
variable "pool" { default = "cscloud_private_floating" }
variable "server_script" { default = "./jenkins.sh" }
variable "security_description" { default = "Terraform security group" }
variable "security_name" { default = "Terraform-Team6" }