# RetailMax: End-to-End Cloud Migration & DevOps Guide

This document is the master operational blueprint for migrating the **RetailMax E-Commerce Monolith** to the Amazon Web Services (AWS) Cloud. It details the architecture, automation scripts, Terraform provisioning, Ansible configuration management, Jenkins CI/CD pipelines, and Prometheus/Grafana monitoring.

---

## 🏛️ Cloud Architecture Overview

```
                          [ Internet Traffic ]
                                  │
                                  ▼
                 [ AWS Application Load Balancer (ALB) ]
                         (Public Subnets across AZs)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼ (Port 5001)                     ▼ (Port 5002)
        [ Target Group: Blue ]            [ Target Group: Green ]
        (Active Production Slot)           (Staging / Cutover Slot)
                 │                                 │
                 └────────────────┬────────────────┘
                                  ▼
                    [ AWS EC2 Monolith Host ]
            ├── Nginx Reverse Proxy (Dynamic cutover)
            ├── RetailMax Monolith Container
            └── Prometheus Node Exporter (Port 9100)
                                  │
                                  ▼
                  [ AWS RDS PostgreSQL Database ]
                    (Private Subnet Multi-AZ)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       [ Prometheus Server ]               [ Grafana Dashboards ]
     (Scrapes :5050/metrics)              (Port 3031 / Live KPIs)
```

---

## 📁 Migration Directory Structure

```
Ecommerce Migration/
├── terraform/                         # Infrastructure as Code (AWS)
│   ├── provider.tf                    # AWS provider & version constraints
│   ├── variables.tf                   # Parameterized inputs (VPC, Subnets, EC2, RDS)
│   ├── main.tf                        # VPC, Subnets, Security Groups, ALB, EC2, RDS
│   ├── outputs.tf                     # ALB DNS, EC2 Public IP, RDS endpoint
│   ├── user_data.sh                   # Cloud-init bootstrap script (Docker, Git, Node Exporter)
│   └── terraform.tfvars.example       # Example variable inputs
│
├── ansible/                           # Configuration Management & Deployment
│   ├── ansible.cfg                    # Ansible runtime settings
│   ├── inventory/hosts.ini            # Managed host targets
│   ├── group_vars/all.yml             # Global deployment & database variables
│   ├── playbooks/
│   │   ├── site.yml                   # Master provisioning & deployment playbook
│   │   ├── setup_server.yml           # Host packages, Docker, Nginx, UFW hardening
│   │   └── deploy_app.yml             # Blue-Green zero-downtime container deploy
│   └── roles/
│       ├── common/                    # OS hardening & administrative utilities
│       ├── docker/                    # Docker Engine CE & Docker Compose plugin
│       ├── nginx/                     # Blue-Green Nginx reverse proxy template
│       ├── retailmax/                 # Container lifecycle & health check verification
│       └── monitoring/                # Prometheus & Grafana container management
│
├── jenkins/                           # Continuous Integration & Delivery
│   ├── Jenkinsfile                    # Declarative multi-stage pipeline
│   └── scripts/
│       ├── health_check.sh            # Automated health probe with retries
│       ├── cutover.sh                 # Zero-downtime Nginx traffic switch
│       └── rollback.sh                # Instant rollback to previous stable slot
│
├── monitoring/                        # Observability & Dashboards
│   ├── prometheus/prometheus.yml      # Prometheus scraper configuration
│   └── grafana/
│       ├── provisioning/datasources/  # Automated Prometheus data source config
│       ├── provisioning/dashboards/   # Automated dashboard loader
│       └── dashboards/retailmax-dashboard.json # Pre-built e-commerce KPI dashboard
│
└── deploy/                            # Deployment Orchestrators
    ├── aws-deploy.sh                  # One-click end-to-end cloud provisioner
    └── blue-green-switch.sh           # Manual or automated slot cutover tool
```

---

## 🛠️ Execution Walkthrough

### Phase 1: Infrastructure Provisioning with Terraform
1. Navigate to the `terraform` directory:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Initialize and plan:
   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```
3. Terraform will provision:
   - Dedicated VPC (`10.0.0.0/16`) with Internet Gateway.
   - 2 Public Subnets across availability zones for high availability.
   - 2 Private Subnets isolated for database workloads.
   - Security groups restricting database access strictly to the application host.
   - AWS Application Load Balancer with **Blue** (`5001`) and **Green** (`5002`) target groups.
   - AWS EC2 instance running Ubuntu 22.04 LTS bootstrapped with Docker CE.
   - AWS RDS PostgreSQL 16 instance.

---

### Phase 2: Server Configuration with Ansible
1. Update `ansible/inventory/hosts.ini` with the EC2 Public IP output from Terraform:
   ```ini
   [app_servers]
   retailmax-prod ansible_host=<EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/retailmax-key.pem
   ```
2. Run the base server setup playbook:
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts.ini playbooks/setup_server.yml
   ```
   *Installs Docker Engine, configures UFW firewall, deploys Nginx reverse proxy, and sets up Prometheus Node Exporter.*

---

### Phase 3: Zero-Downtime Blue-Green Application Release
1. When a new release is triggered, deploy to the idle slot (e.g. `green`):
   ```bash
   ansible-playbook -i inventory/hosts.ini playbooks/deploy_app.yml \
     --extra-vars "active_slot=blue"
   ```
2. The automation performs:
   - Launches container `retailmax-green` on port `5002`.
   - Probes `http://127.0.0.1:5002/health` up to 15 times.
   - Once verified `UP`, reloads Nginx to route live traffic to port `5002`.
   - Stops the previous `blue` container without dropping a single active customer connection.

---

### Phase 4: Jenkins CI/CD Pipeline Automation
The declarative [Jenkinsfile](file:///c:/Users/visha/OneDrive/Desktop/Ecommerce%20Migration/jenkins/Jenkinsfile) executes on every GitHub push:
1. **SCM Checkout**: Clones latest commit.
2. **Build & Unit Test**: Validates Express endpoints and compiles React assets.
3. **Container Packaging**: Builds multi-stage Docker images tagged with build numbers.
4. **Security Scan**: Uses Trivy to scan images for known CVEs.
5. **Artifact Storage**: Pushes images to AWS ECR.
6. **Deploy to Standby**: Executes Ansible playbook against standby slot.
7. **Automated Health Check**: Runs [health_check.sh](file:///c:/Users/visha/OneDrive/Desktop/Ecommerce%20Migration/jenkins/scripts/health_check.sh).
8. **Cutover Traffic**: Runs [cutover.sh](file:///c:/Users/visha/OneDrive/Desktop/Ecommerce%20Migration/jenkins/scripts/cutover.sh).
9. **Failure Fallback**: In case of health check failure, executes [rollback.sh](file:///c:/Users/visha/OneDrive/Desktop/Ecommerce%20Migration/jenkins/scripts/rollback.sh) automatically to revert to the last stable release.

---

### Phase 5: Monitoring & Observability
1. **Prometheus** scrapes application metrics from `/metrics` every 10 seconds:
   - `retailmax_http_request_duration_seconds` (Latency percentiles p50, p95, p99)
   - `retailmax_http_requests_total` (Throughput and error rates)
   - `retailmax_orders_total` & `retailmax_revenue_total_dollars` (Real-time business performance)
2. **Grafana** automatically provisions dashboards displaying real-time traffic, JVM/Node memory, and system health.
