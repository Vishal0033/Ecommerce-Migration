# Terraform Provider & Version Constraints
# Project: RetailMax E-Commerce Monolith Cloud Migration

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Optional remote state backend configuration:
  # backend "s3" {
  #   bucket         = "retailmax-terraform-state-bucket"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "retailmax-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "RetailMax"
      ManagedBy   = "Terraform"
      Environment = var.environment
      Platform    = "Monolith-Cloud-Migration"
    }
  }
}
