# Input Variables for RetailMax AWS Infrastructure

variable "aws_region" {
  description = "Target AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier used in resource naming and tags"
  type        = string
  default     = "retailmax"
}

# --- Networking ---
variable "vpc_cidr" {
  description = "CIDR block for the dedicated VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for high availability"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB & Bastion/EC2)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (RDS PostgreSQL)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# --- Compute (EC2) ---
variable "instance_type" {
  description = "EC2 instance type for running the containerized monolith"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Name of the existing AWS EC2 Key Pair for SSH access"
  type        = string
  default     = "retailmax-key"
}

variable "admin_cidr_blocks" {
  description = "Allowed CIDR blocks for SSH and management access"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Recommendation: restrict to corporate/office IP in production
}

# --- Database (AWS RDS PostgreSQL) ---
variable "db_instance_class" {
  description = "Database instance size"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Default database name"
  type        = string
  default     = "retailmax_db"
}

variable "db_username" {
  description = "Master username for PostgreSQL database"
  type        = string
  default     = "retailmax_admin"
}

variable "db_password" {
  description = "Master password for PostgreSQL database"
  type        = string
  sensitive   = true
  default     = "RetailMaxSecurePass2026!"
}
