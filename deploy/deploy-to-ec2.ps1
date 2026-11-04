# RetailMax Windows PowerShell Direct Deployer to AWS EC2
# Usage: .\deploy\deploy-to-ec2.ps1 -Ec2Ip "100.58.244.39" -KeyPath "C:\Users\visha\Downloads\retailmax-aws-key.pem"

param (
    [string]$Ec2Ip = "100.58.244.39",
    [string]$KeyPath = ""
)

if (-not $KeyPath -or -not (Test-Path $KeyPath)) {
    if (Test-Path "$PSScriptRoot\retailmax-aws-key.pem") {
        $KeyPath = "$PSScriptRoot\retailmax-aws-key.pem"
    } elseif (Test-Path "C:\Users\visha\Downloads\retailmax-aws-key.pem") {
        $KeyPath = "C:\Users\visha\Downloads\retailmax-aws-key.pem"
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying RetailMax Monolith to AWS EC2 from Windows" -ForegroundColor Cyan
Write-Host "   Target Host:  $Ec2Ip" -ForegroundColor Yellow
Write-Host "   SSH Key:      $KeyPath" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test SSH connectivity
Write-Host "`n[1/4] Testing SSH connection to EC2..." -ForegroundColor Green
ssh -i $KeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@$Ec2Ip "echo 'SSH Connection Successful!'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect via SSH. Verify your EC2 IP and KeyPath." -ForegroundColor Red
    exit 1
}

# 2. Sync / Clone latest GitHub repository onto EC2
Write-Host "`n[2/4] Syncing latest codebase from GitHub onto EC2..." -ForegroundColor Green
$syncCmd = @"
if [ ! -d "/opt/retailmax/.git" ]; then
    echo "Cloning repository..."
    sudo rm -rf /opt/retailmax
    sudo git clone https://github.com/Vishal0033/Ecommerce-Migration.git /opt/retailmax
    sudo chown -R ubuntu:ubuntu /opt/retailmax
else
    echo "Pulling latest code..."
    cd /opt/retailmax
    git fetch origin main
    git reset --hard origin/main
fi
"@

ssh -i $KeyPath ubuntu@$Ec2Ip $syncCmd

# 3. Build & Launch Docker containers
Write-Host "`n[3/4] Building and launching RetailMax Docker stack..." -ForegroundColor Green
$launchCmd = @"
cd /opt/retailmax
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build
echo "Waiting for services to initialize..."
sleep 10
echo "Initializing RDS PostgreSQL Database..."
docker compose -f docker-compose.prod.yml exec -T backend node scripts/setup-db.js || true
docker compose -f docker-compose.prod.yml ps
"@

ssh -i $KeyPath ubuntu@$Ec2Ip $launchCmd

# 4. Validate live health
Write-Host "`n[4/4] Validating local and ALB health status..." -ForegroundColor Green
$probeCmd = @"
curl -s http://127.0.0.1:5001/health || curl -s http://127.0.0.1/health
"@
ssh -i $KeyPath ubuntu@$Ec2Ip $probeCmd

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Completed!" -ForegroundColor Green
Write-Host "   Public Store URL (AWS ALB): http://retailmax-alb-1087523635.us-east-1.elb.amazonaws.com" -ForegroundColor Yellow
Write-Host "   Public Health Check:        http://retailmax-alb-1087523635.us-east-1.elb.amazonaws.com/health" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
