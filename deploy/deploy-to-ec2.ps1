# RetailMax Windows PowerShell Direct Deployer to AWS EC2
# Usage: .\deploy\deploy-to-ec2.ps1 -Ec2Ip "34.xxx.xxx.xxx" -KeyPath "C:\path\to\retailmax-aws-key.pem"

param (
    [Parameter(Mandatory=$true)]
    [string]$Ec2Ip,

    [Parameter(Mandatory=$true)]
    [string]$KeyPath,

    [string]$Slot = "blue",
    [int]$Port = 5001
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying RetailMax Monolith to AWS EC2 from Windows" -ForegroundColor Cyan
Write-Host "   Target Host:  $Ec2Ip" -ForegroundColor Yellow
Write-Host "   Slot:         $Slot (Port $Port)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test SSH connectivity
Write-Host "`n[1/3] Testing SSH connection to EC2..." -ForegroundColor Green
ssh -i $KeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$Ec2Ip "echo 'SSH Connection Successful!'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect via SSH. Verify your EC2 IP and KeyPath." -ForegroundColor Red
    exit 1
}

# 2. Sync project files to EC2
Write-Host "`n[2/3] Transferring application files to EC2..." -ForegroundColor Green
ssh -i $KeyPath ubuntu@$Ec2Ip "mkdir -p /opt/retailmax"
scp -i $KeyPath -r docker-compose.yml nginx prometheus ubuntu@${Ec2Ip}:/opt/retailmax/

# 3. Bootstrap and start container on EC2
Write-Host "`n[3/3] Launching RetailMax stack on EC2..." -ForegroundColor Green
$remoteCommands = @"
cd /opt/retailmax
sudo docker compose pull || true
sudo docker compose up -d
sudo docker ps
"@

ssh -i $KeyPath ubuntu@$Ec2Ip $remoteCommands

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Command Completed!" -ForegroundColor Green
Write-Host "   Probing health: http://$Ec2Ip/health" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://$Ec2Ip/health" -TimeoutSec 5 | ConvertTo-Json
} catch {
    Write-Host "ALB or EC2 security group may take 1-2 minutes to finish initializing." -ForegroundColor Gray
}

