# RetailMax Infrastructure as Code (Terraform)
# Defines VPC, High Availability Subnets, Security Groups, EC2 Host, ALB (Blue/Green), and RDS PostgreSQL

# -------------------------------------------------------------
# 1. NETWORKING (VPC, Subnets, Routing)
# -------------------------------------------------------------
resource "aws_vpc" "retailmax_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.retailmax_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public Subnets (Multi-AZ for ALB & EC2)
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.retailmax_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets (Multi-AZ for RDS Database)
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.retailmax_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# Public Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.retailmax_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# -------------------------------------------------------------
# 2. SECURITY GROUPS
# -------------------------------------------------------------

# Application Load Balancer Security Group
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  description = "Allows public incoming HTTP/HTTPS traffic to ALB"
  vpc_id      = aws_vpc.retailmax_vpc.id

  ingress {
    description = "HTTP Public"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Public"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic to EC2 target groups"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# EC2 Instance Security Group
resource "aws_security_group" "ec2_sg" {
  name        = "${var.project_name}-ec2-sg"
  description = "Security group for RetailMax Monolith EC2 host"
  vpc_id      = aws_vpc.retailmax_vpc.id

  ingress {
    description     = "HTTP from Application Load Balancer"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description     = "Blue Container Slot from ALB"
    from_port       = 5001
    to_port         = 5001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description     = "Green Container Slot from ALB"
    from_port       = 5002
    to_port         = 5002
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description     = "Direct App API Port"
    from_port       = 5050
    to_port         = 5050
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description = "SSH administrative access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  ingress {
    description = "Prometheus Node Exporter metrics"
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound traffic (internet & package downloads)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# RDS PostgreSQL Database Security Group
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Allows incoming PostgreSQL traffic strictly from EC2 instances"
  vpc_id      = aws_vpc.retailmax_vpc.id

  ingress {
    description     = "PostgreSQL port from EC2 Security Group"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# -------------------------------------------------------------
# 3. IAM ROLE & INSTANCE PROFILE FOR EC2
# -------------------------------------------------------------
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# -------------------------------------------------------------
# 4. COMPUTE (EC2 Instance)
# -------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "retailmax_server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  key_name             = var.key_name

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name = "${var.project_name}-app-server"
    Role = "ApplicationHost"
  }
}

# -------------------------------------------------------------
# 5. APPLICATION LOAD BALANCER & BLUE-GREEN TARGET GROUPS
# -------------------------------------------------------------
resource "aws_lb" "retailmax_alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public[0].id, aws_subnet.public[1].id]

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# Blue Target Group (Active Production Slot)
resource "aws_lb_target_group" "tg_blue" {
  name        = "${var.project_name}-tg-blue"
  port        = 5001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.retailmax_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "5001"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 15
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg-blue"
    Slot = "Blue"
  }
}

# Green Target Group (Staging / Cutover Slot)
resource "aws_lb_target_group" "tg_green" {
  name        = "${var.project_name}-tg-green"
  port        = 5002
  protocol    = "HTTP"
  vpc_id      = aws_vpc.retailmax_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "5002"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 15
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg-green"
    Slot = "Green"
  }
}

# Attach EC2 instance to Blue target group
resource "aws_lb_target_group_attachment" "attach_blue" {
  target_group_arn = aws_lb_target_group.tg_blue.arn
  target_id        = aws_instance.retailmax_server.id
  port             = 5001
}

# HTTP Listener routing to Blue (switched to Green by CI/CD cutover)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.retailmax_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_blue.arn
  }
}

# -------------------------------------------------------------
# 6. RELATIONAL DATABASE (AWS RDS PostgreSQL)
# -------------------------------------------------------------
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private[0].id, aws_subnet.private[1].id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-postgres"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = 100
  storage_type           = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  skip_final_snapshot    = true
  publicly_accessible    = false
  multi_az               = false # Toggle true for production high availability

  tags = {
    Name = "${var.project_name}-postgres-db"
  }
}
