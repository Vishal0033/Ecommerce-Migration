#!/usr/bin/env bash
# End-to-End AWS Cloud Migration & Provisioning Automator
# Combines Terraform (IaC) and Ansible (Configuration Management)

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "================================================================="
echo "☁️  RetailMax Cloud Migration Execution Engine"
echo "================================================================="

# 1. Terraform Infrastructure Provisioning
echo "Step 1: Provisioning AWS Cloud Infrastructure via Terraform..."
cd "$ROOT_DIR/terraform"

if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  terraform.tfvars not found. Creating from example template..."
    cp terraform.tfvars.example terraform.tfvars
fi

terraform init
terraform plan -out=tfplan
echo "Applying Terraform plan to AWS..."
terraform apply -auto-approve tfplan

# Extract outputs
EC2_IP=$(terraform output -raw ec2_public_ip)
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

echo "✅ AWS Infrastructure Provisioned Successfully!"
echo "   - EC2 Public IP:   $EC2_IP"
echo "   - ALB DNS:         $ALB_DNS"
echo "   - RDS Endpoint:    $RDS_ENDPOINT"

# 2. Update Ansible Inventory
echo "Step 2: Dynamically Updating Ansible Inventory..."
cd "$ROOT_DIR/ansible"

cat <<EOF > inventory/hosts.ini
[app_servers]
retailmax-prod ansible_host=$EC2_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/retailmax-key.pem

[all:vars]
ansible_python_interpreter=/usr/bin/python3
environment_name=production
db_host=$RDS_ENDPOINT
EOF

echo "Waiting 30 seconds for EC2 instance bootstrap and SSH readiness..."
sleep 30

# 3. Execute Ansible Playbook
echo "Step 3: Running Ansible Configuration & Deployment Playbook..."
ansible-playbook -i inventory/hosts.ini playbooks/site.yml

# 4. Final Verification
echo "Step 4: Running Production Health Checks via ALB..."
curl -s "http://$ALB_DNS/health" | jq . || curl -s "http://$EC2_IP/health" | jq .

echo "================================================================="
echo "🎉 RetailMax Cloud Migration COMPLETED!"
echo "   Access Live Store via AWS ALB: http://$ALB_DNS"
echo "================================================================="
