# RetailMax: Cloud Migration & DevOps Roadmap

This guide details the step-by-step procedure to migrate the **RetailMax E-Commerce Monolith** to the AWS Cloud with automated CI/CD and zero-downtime releases, as outlined in the SRM Project Specification.

---

## Migration Architecture Overview

```
                          [ Internet Traffic ]
                                  │
                                  ▼
                    [ AWS Route 53 (DNS) ]
                                  │
                                  ▼
                [ AWS Application Load Balancer (ALB) ]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
        [ Target Group: Blue ]            [ Target Group: Green ]
      (EC2: Live / Port 5001)           (EC2: Staging / Port 5002)
                 │                                 │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                  [ AWS RDS PostgreSQL Database ]
                         (Multi-AZ Setup)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       [ Prometheus Server ]               [ Grafana Dashboards ]
     (Scrapes :5000/metrics)              (Port 3000 / Real-time)
```

---

## 1. Phase 1: Containerization (Docker)
- The application is decoupled into two multi-stage container images:
  - `retailmax-backend`: Node.js 20 Alpine with Prisma Client and Prometheus instrumentation.
  - `retailmax-frontend`: React + Tailwind SPA compiled into static assets and served by Nginx.
- To test the full stack locally:
  ```bash
  docker-compose up --build
  ```

---

## 2. Phase 2: Infrastructure as Code (Terraform)
Terraform provisions reproducible AWS infrastructure:
- **Networking**: VPC (10.0.0.0/16), 2 Public Subnets, 2 Private Subnets, Route Tables, Internet Gateway.
- **Security Groups**:
  - `alb-sg`: Allows inbound ports 80/443 from anywhere.
  - `ec2-sg`: Allows inbound traffic to app ports only from ALB SG.
  - `rds-sg`: Allows port 5432 only from EC2 instances.
- **Compute**: AWS EC2 instance (`t3.medium`) or ECS cluster.
- **Database**: AWS RDS PostgreSQL 16 instance.
- **Load Balancer**: Application Load Balancer (ALB) with listener rules for Blue/Green target groups.

---

## 3. Phase 3: Configuration Management (Ansible)
Ansible playbooks automate host provisioning:
1. Installs Docker CE, Docker Compose, Git, and Nginx.
2. Configures Docker daemon logging and security parameters.
3. Deploys environment variables securely via Ansible Vault.
4. Manages systemd services for monitoring agents.

---

## 4. Phase 4: Jenkins CI/CD Pipeline
A Jenkins pipeline triggers on code commits to `main`:
1. **Checkout**: Pulls latest repository code.
2. **Lint & Test**: Runs automated tests (`npm test`, `npm run build`).
3. **Build & Package**: Builds Docker images tagged with Git commit SHA.
4. **Security Scan**: Scans images with Trivy/Clair for CVE vulnerabilities.
5. **Push Artifacts**: Pushes verified images to AWS Elastic Container Registry (ECR).
6. **Blue-Green Deploy**:
   - Deploys new container to idle target group (Green).
   - Performs automated health check against `http://<green-target>/health`.
   - Once healthy, flips ALB/Nginx traffic to Green.
   - If health check fails, initiates immediate automatic rollback to Blue.

---

## 5. Phase 5: Monitoring & Observability
- **Prometheus** scrapes metrics every 10s from `http://backend:5000/metrics`.
- **Grafana** visualizes:
  - System performance (CPU, Memory RSS, Event loop latency).
  - Web traffic latency percentiles (p50, p95, p99).
  - Business KPIs (Orders placed, revenue processed).
- Alerting rules trigger notifications if error rates exceed 1% or health check returns `DOWN`.
