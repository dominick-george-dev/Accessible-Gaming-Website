variable "flavor" { default = "m1.large" }
variable "image" { default = "Rocky 9.5 20241118" }
variable "name" { default = "Jenkins-Pipeline" }
variable "keypair" { default = "cloud" }
variable "pool" { default = "cscloud_private_floating" }
variable "server_script" { default = "./jenkins.sh" }
variable "security_description" { default = "Terraform security group" }
variable "security_name" { default = "Terraform-Team6" }
variable "auth_url" {
  type        = string
  description = "OpenStack auth URL (Keystone)"
}

variable "user_name" {
  type        = string
  description = "OpenStack username"
}

variable "password" {
  type        = string
  description = "OpenStack password"
  sensitive   = true
}

variable "project_name" {
  type        = string
  description = "OpenStack project/tenant name"
}

variable "domain_name" {
  type        = string
  description = "OpenStack domain name"
  default     = "Default"
}

variable "region" {
  type        = string
  description = "OpenStack region"
  default     = ""
}