# RetailMax AWS Cost-Saver: Stop Cloud Services
# Usage: .\deploy\stop-aws.ps1

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⏸️  Stopping AWS Services to Save Cost" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Stop EC2 Application Instance
Write-Host "`n[1/2] Stopping EC2 Instance (i-06d6051930d804baf)..." -ForegroundColor Yellow
aws ec2 stop-instances --instance-ids i-06d6051930d804baf --region us-east-1

# 2. Stop RDS PostgreSQL Database
Write-Host "`n[2/2] Stopping RDS Database (retailmax-postgres)..." -ForegroundColor Yellow
aws rds stop-db-instance --db-instance-identifier retailmax-postgres --region us-east-1

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ AWS Compute Services are now STOPPED!" -ForegroundColor Green
Write-Host "   - EC2 Compute Cost:  $0.00 / hr" -ForegroundColor Green
Write-Host "   - RDS Compute Cost:  $0.00 / hr" -ForegroundColor Green
Write-Host "   - Static IP:         98.80.58.78 (Preserved permanently)" -ForegroundColor Green
Write-Host "   - Restart anytime:   .\deploy\start-aws.ps1" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
