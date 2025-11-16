#!/bin/bash

# Simple Q&A Setup Guide

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ✅ Prerequisites Installed Successfully!    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Great! Docker, kubeadm, kubelet, and kubectl are now installed.${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get current info
CURRENT_IP=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
HOSTNAME=$(hostname)

echo "📍 Your current machine:"
echo "   IP: ${CURRENT_IP}"
echo "   Hostname: ${HOSTNAME}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Quick questionnaire
echo -e "${YELLOW}Let me ask you a few quick questions:${NC}"
echo ""

echo "❓ Question 1: How many total machines do you have?"
read -p "   Enter number (e.g., 1, 3, 7): " total_machines
echo ""

if [ "$total_machines" -eq 1 ]; then
    echo -e "${YELLOW}⚠️  With 1 machine, we can only create a single-node cluster${NC}"
    echo "   (No high availability, but good for learning)"
    echo ""
    read -p "Continue with single-node setup? (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        echo ""
        echo -e "${GREEN}Setting up single-node cluster...${NC}"
        echo ""
        echo "Run this command:"
        echo -e "${CYAN}sudo kubeadm init --pod-network-cidr=10.244.0.0/16${NC}"
        echo ""
        echo "After it completes, run:"
        echo -e "${CYAN}mkdir -p \$HOME/.kube${NC}"
        echo -e "${CYAN}sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config${NC}"
        echo -e "${CYAN}sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config${NC}"
        echo ""
        echo "Then install Calico networking:"
        echo -e "${CYAN}kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml${NC}"
        echo ""
        echo "Finally, allow pods on master node:"
        echo -e "${CYAN}kubectl taint nodes --all node-role.kubernetes.io/control-plane-${NC}"
        echo ""
        read -p "Do you want me to run these commands for you? (yes/no): " auto_run
        
        if [[ $auto_run == "yes" ]]; then
            echo ""
            echo -e "${GREEN}Starting initialization...${NC}"
            echo ""
            sudo kubeadm init --pod-network-cidr=10.244.0.0/16
            
            mkdir -p $HOME/.kube
            sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
            sudo chown $(id -u):$(id -g) $HOME/.kube/config
            
            echo ""
            echo -e "${GREEN}Installing Calico...${NC}"
            kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
            
            echo ""
            echo -e "${GREEN}Allowing workloads on master node...${NC}"
            kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true
            
            echo ""
            echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
            echo -e "${BLUE}║           ✅ Cluster Setup Complete!           ║${NC}"
            echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
            echo ""
            echo "Check your cluster:"
            echo -e "${CYAN}kubectl get nodes${NC}"
            echo ""
            kubectl get nodes
        fi
    fi
    exit 0
fi

echo "❓ Question 2: What role should THIS machine (${CURRENT_IP}) be?"
echo "   1) Load Balancer (HAProxy)"
echo "   2) Master Node (Control Plane)"
echo "   3) Worker Node"
echo ""
read -p "   Enter choice (1/2/3): " role_choice
echo ""

case $role_choice in
    1)
        echo -e "${CYAN}Setting up as Load Balancer...${NC}"
        echo ""
        echo "I need the IP addresses of your MASTER nodes."
        echo ""
        read -p "How many master nodes will you have? (1 or 3): " num_masters
        echo ""
        
        read -p "Master 1 IP: " MASTER1_IP
        if [ "$num_masters" -eq 3 ]; then
            read -p "Master 2 IP: " MASTER2_IP
            read -p "Master 3 IP: " MASTER3_IP
        fi
        
        echo ""
        echo -e "${GREEN}Installing HAProxy...${NC}"
        sudo apt-get update
        sudo apt-get install -y haproxy
        
        echo ""
        echo -e "${GREEN}Configuring HAProxy...${NC}"
        sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.backup
        
        if [ "$num_masters" -eq 3 ]; then
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
        else
            sudo tee /etc/haproxy/haproxy.cfg > /dev/null <<EOF
global
    log /dev/log local0
    chroot /var/lib/haproxy
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
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

listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /
    stats refresh 10s
EOF
        fi
        
        sudo systemctl restart haproxy
        sudo systemctl enable haproxy
        
        echo ""
        echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║      ✅ Load Balancer Setup Complete!          ║${NC}"
        echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Stats page: http://${CURRENT_IP}:8404"
        echo ""
        echo -e "${YELLOW}Next step:${NC} Set up your master node(s)"
        ;;
        
    2)
        echo -e "${CYAN}Setting up as Master Node...${NC}"
        echo ""
        read -p "Is this the FIRST master node? (yes/no): " is_first
        echo ""
        
        if [[ $is_first == "yes" ]]; then
            read -p "Load Balancer IP address: " LB_IP
            
            echo ""
            echo -e "${GREEN}Initializing first master node...${NC}"
            echo -e "${YELLOW}This may take a few minutes...${NC}"
            echo ""
            
            sudo kubeadm init --control-plane-endpoint "${LB_IP}:6443" --upload-certs --pod-network-cidr=10.244.0.0/16 | tee /tmp/kubeadm-init.log
            
            mkdir -p $HOME/.kube
            sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
            sudo chown $(id -u):$(id -g) $HOME/.kube/config
            
            echo ""
            echo -e "${GREEN}Installing Calico network plugin...${NC}"
            kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
            
            echo ""
            echo -e "${GREEN}Installing Ingress-NGINX...${NC}"
            kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.49.0/deploy/static/provider/baremetal/deploy.yaml
            
            echo ""
            echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
            echo -e "${BLUE}║      ✅ First Master Setup Complete!           ║${NC}"
            echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}IMPORTANT: Save these commands for other nodes!${NC}"
            echo ""
            echo "To get join commands, run:"
            echo ""
            echo "For additional masters:"
            echo -e "${CYAN}kubeadm token create --print-join-command --certificate-key \$(kubeadm init phase upload-certs --upload-certs | tail -1)${NC}"
            echo ""
            echo "For workers:"
            echo -e "${CYAN}kubeadm token create --print-join-command${NC}"
            echo ""
            
            # Save join commands
            echo ""
            echo "Generating join commands..."
            echo ""
            echo "=== Worker Join Command ===" > /tmp/join-commands.txt
            kubeadm token create --print-join-command >> /tmp/join-commands.txt
            echo "" >> /tmp/join-commands.txt
            echo "=== Master Join Command ===" >> /tmp/join-commands.txt
            kubeadm token create --print-join-command --certificate-key $(kubeadm init phase upload-certs --upload-certs | tail -1) >> /tmp/join-commands.txt
            
            echo "Join commands saved to: /tmp/join-commands.txt"
            echo ""
            cat /tmp/join-commands.txt
            
        else
            echo "Copy the join command from your first master node and run it here."
            echo ""
            echo "The command will look like:"
            echo "sudo kubeadm join LB_IP:6443 --token ... --control-plane --certificate-key ..."
            echo ""
            read -p "Paste the full join command: " join_cmd
            
            if [ -n "$join_cmd" ]; then
                eval "$join_cmd"
                
                mkdir -p $HOME/.kube
                sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
                sudo chown $(id -u):$(id -g) $HOME/.kube/config
                
                echo ""
                echo -e "${GREEN}✅ Master node joined successfully!${NC}"
            fi
        fi
        ;;
        
    3)
        echo -e "${CYAN}Setting up as Worker Node...${NC}"
        echo ""
        echo "You need the join command from your master node."
        echo ""
        echo "On any master node, run:"
        echo -e "${CYAN}kubeadm token create --print-join-command${NC}"
        echo ""
        read -p "Paste the join command here: " join_cmd
        
        if [ -n "$join_cmd" ]; then
            eval "$join_cmd"
            echo ""
            echo -e "${GREEN}✅ Worker node joined successfully!${NC}"
            echo ""
            echo "Check from master node:"
            echo -e "${CYAN}kubectl get nodes${NC}"
        fi
        ;;
esac
