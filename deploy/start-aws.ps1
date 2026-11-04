# RetailMax AWS Cloud Restorer: Start Cloud Services
# Usage: .\deploy\start-aws.ps1

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "▶️  Starting AWS Cloud Services" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start RDS PostgreSQL Database
Write-Host "`n[1/3] Starting RDS Database (retailmax-postgres)..." -ForegroundColor Yellow
aws rds start-db-instance --db-instance-identifier retailmax-postgres --region us-east-1

# 2. Start EC2 Application Instance
Write-Host "`n[2/3] Starting EC2 Instance (i-06d6051930d804baf)..." -ForegroundColor Yellow
aws ec2 start-instances --instance-ids i-06d6051930d804baf --region us-east-1

Write-Host "`n[3/3] Waiting 30 seconds for host & containers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ AWS Services are now RUNNING!" -ForegroundColor Green
Write-Host "   - Static Elastic IP: 98.80.58.78 (Unchanged)" -ForegroundColor Green
Write-Host "   - Live Storefront:   http://retailmax-alb-1087523635.us-east-1.elb.amazonaws.com" -ForegroundColor Yellow
Write-Host "   - Health Check:      http://retailmax-alb-1087523635.us-east-1.elb.amazonaws.com/health" -ForegroundColor Yellow
Write-Host "   - Grafana Dashboard: http://98.80.58.78:3031" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

try {
    $res = Invoke-RestMethod -Uri "http://retailmax-alb-1087523635.us-east-1.elb.amazonaws.com/health" -TimeoutSec 5
    Write-Host "`nALB Health Status: $($res.status)" -ForegroundColor Green
} catch {
    Write-Host "Note: Database and ALB health checks typically take 1-2 minutes to report healthy." -ForegroundColor Gray
}

