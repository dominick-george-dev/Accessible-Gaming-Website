terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = ">= 1.47.0"
    }
  }
}

provider "openstack" {
  auth_url     = var.auth_url
  user_name    = var.user_name
  password     = var.password
  project_name = var.project_name
  domain_name  = var.domain_name
  region       = var.region
}