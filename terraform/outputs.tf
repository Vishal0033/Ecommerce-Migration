# Output Values for Provisioned Infrastructure

output "vpc_id" {
  description = "The ID of the RetailMax VPC"
  value       = aws_vpc.retailmax_vpc.id
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance hosting the containerized monolith"
  value       = aws_instance.retailmax_server.public_ip
}

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.retailmax_alb.dns_name
}

output "rds_endpoint" {
  description = "Connection endpoint of the PostgreSQL RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "target_group_blue_arn" {
  description = "ARN of the Blue (Active) target group"
  value       = aws_lb_target_group.tg_blue.arn
}

output "target_group_green_arn" {
  description = "ARN of the Green (Staging) target group"
  value       = aws_lb_target_group.tg_green.arn
}

output "alb_listener_arn" {
  description = "ARN of the ALB HTTP listener for automated Blue/Green cutover"
  value       = aws_lb_listener.http.arn
}
