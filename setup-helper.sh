#!/bin/bash

# HA K8s Cluster Setup Helper Script
# This script helps automate the setup process based on the node type

set -e

echo "=========================================="
echo "HA Kubernetes Cluster Setup Helper"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get current IP
CURRENT_IP=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
print_info "Current IP: $CURRENT_IP"
print_info "Current Hostname: $(hostname)"
echo ""

# Menu
echo "Select the node type to set up:"
echo "1) Load Balancer (HAProxy)"
echo "2) Master Node (Control Plane)"
echo "3) Worker Node"
echo "4) Install prerequisites (Docker, kubeadm, kubelet, kubectl)"
echo "5) Exit"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        echo ""
        print_info "Setting up Load Balancer (HAProxy)..."
        read -p "Enter Master 1 IP: " MASTER1_IP
        read -p "Enter Master 2 IP: " MASTER2_IP
        read -p "Enter Master 3 IP: " MASTER3_IP
        
        print_info "Installing HAProxy..."
        sudo apt-get update
        sudo apt-get install -y haproxy
        
        print_info "Backing up original HAProxy config..."
        sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.backup
        
        print_info "Configuring HAProxy..."
        sudo tee /etc/haproxy/haproxy.cfg > /dev/null <<EOF
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend kubernetes-frontend
    bind *:6443
    option tcplog
    mode tcp
    default_backend kubernetes-backend

backend kubernetes-backend
    mode tcp
    balance roundrobin
    option tcp-check
    server master1 ${MASTER1_IP}:6443 check
    server master2 ${MASTER2_IP}:6443 check
    server master3 ${MASTER3_IP}:6443 check

listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /
    stats refresh 10s
    stats admin if LOCALHOST
EOF
        
        print_info "Restarting HAProxy..."
        sudo systemctl restart haproxy
        sudo systemctl enable haproxy
        
        print_info "Checking HAProxy status..."
        sudo systemctl status haproxy --no-pager
        
        print_info "Load Balancer setup complete!"
        print_info "HAProxy is listening on port 6443"
        print_info "Stats page available at: http://${CURRENT_IP}:8404"
        ;;
        
    2)
        echo ""
        print_info "Setting up Master Node..."
        read -p "Is this the FIRST master node? (y/n): " is_first
        
        if [[ $is_first == "y" || $is_first == "Y" ]]; then
            read -p "Enter Load Balancer IP: " LB_IP
            print_info "Initializing first master node..."
            
            print_warning "Run the following command:"
            echo ""
            echo "sudo kubeadm init --control-plane-endpoint \"${LB_IP}:6443\" --upload-certs --pod-network-cidr=10.244.0.0/16"
            echo ""
            print_warning "After initialization, run:"
            echo ""
            echo "mkdir -p \$HOME/.kube"
            echo "sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config"
            echo "sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"
            echo ""
            echo "kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml"
            echo "kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.49.0/deploy/static/provider/baremetal/deploy.yaml"
            echo ""
            print_warning "Save the join commands that will be displayed!"
        else
            print_info "To join as additional master node:"
            print_warning "On the FIRST master node, run:"
            echo ""
            echo "kubeadm token create --print-join-command --certificate-key \$(kubeadm init phase upload-certs --upload-certs | tail -1)"
            echo ""
            print_warning "Then run the provided command on THIS node with sudo"
            echo ""
            print_warning "After joining, set up kubeconfig:"
            echo "mkdir -p \$HOME/.kube"
            echo "sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config"
            echo "sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"
        fi
        ;;
        
    3)
        echo ""
        print_info "Setting up Worker Node..."
        print_warning "On any MASTER node, run:"
        echo ""
        echo "kubeadm token create --print-join-command"
        echo ""
        print_warning "Then run the provided command on THIS worker node with sudo"
        ;;
        
    4)
        echo ""
        print_info "Installing prerequisites (Docker, kubeadm, kubelet, kubectl)..."
        
        # Disable swap
        print_info "Disabling swap..."
        sudo swapoff -a
        sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
        
        # Install Docker
        print_info "Installing Docker..."
        sudo apt-get update
        sudo apt install docker.io -y
        sudo chmod 666 /var/run/docker.sock
        sudo systemctl enable docker
        
        # Install kubeadm, kubelet, kubectl
        print_info "Installing kubeadm, kubelet, kubectl..."
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
        sudo mkdir -p -m 755 /etc/apt/keyrings
        curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
        sudo apt update
        sudo apt install -y kubeadm=1.30.0-1.1 kubelet=1.30.0-1.1 kubectl=1.30.0-1.1
        sudo apt-mark hold kubeadm kubelet kubectl
        
        # Enable kernel modules
        print_info "Configuring kernel modules..."
        sudo modprobe br_netfilter
        sudo modprobe overlay
        
        cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

        cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

        sudo sysctl --system
        
        print_info "Prerequisites installation complete!"
        print_info "Docker version: $(docker --version)"
        print_info "Kubeadm version: $(kubeadm version -o short)"
        print_info "Kubelet version: $(kubelet --version)"
        print_info "Kubectl version: $(kubectl version --client -o yaml | grep gitVersion)"
        ;;
        
    5)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_info "Script execution completed!"
