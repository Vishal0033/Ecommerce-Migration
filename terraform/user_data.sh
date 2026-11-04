#!/bin/bash
# RetailMax EC2 Cloud-Init Bootstrap Script
# Prepares host with Docker CE, Docker Compose, Git, Nginx, and system dependencies

set -e

echo "=== [1/5] Updating system packages ==="
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    jq \
    python3 \
    python3-pip

echo "=== [2/5] Installing Docker Engine ==="
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
systemctl enable docker
systemctl start docker

# Add ubuntu default user to docker group
usermod -aG docker ubuntu

echo "=== [3/5] Installing Prometheus Node Exporter ==="
NODE_EXPORTER_VERSION="1.7.0"
curl -sSL "https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz" | tar -xzv -C /tmp/
mv /tmp/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
rm -rf /tmp/node_exporter*

# Setup systemd service for Node Exporter
cat <<EOF > /etc/systemd/system/node_exporter.service
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=nobody
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=default.target
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

echo "=== [4/5] Preparing RetailMax application directories ==="
mkdir -p /opt/retailmax/nginx
mkdir -p /opt/retailmax/monitoring
mkdir -p /opt/retailmax/data
chown -R ubuntu:ubuntu /opt/retailmax

echo "=== [5/5] Bootstrap completed successfully ==="
docker --version
docker compose version
echo "RetailMax Host initialization finished at $(date)" > /var/log/retailmax-bootstrap.log

