#!/bin/bash

# 🎓 BEGINNER'S GUIDE - HA Kubernetes Cluster Setup
# This script will walk you through EVERYTHING step by step

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║$(printf '%*s' 60 | tr ' ' ' ')║${NC}"
    printf "${BLUE}║${CYAN}%*s%*s${BLUE}║${NC}\n" $((30+${#1}/2)) "$1" $((30-${#1}/2)) ""
    echo -e "${BLUE}║$(printf '%*s' 60 | tr ' ' ' ')║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}✓ STEP $1:${NC} $2"
}

print_info() {
    echo -e "${CYAN}ℹ ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC} $1"
}

print_error() {
    echo -e "${RED}✗ ${NC} $1"
}

ask_question() {
    echo -e "${YELLOW}❓${NC} $1"
}

clear
print_header "Welcome to HA Kubernetes Cluster Setup!"

echo -e "${CYAN}This guide will help you set up a High Availability Kubernetes cluster.${NC}"
echo -e "${CYAN}Don't worry if you're new to this - I'll explain everything!${NC}"
echo ""

# Explain what we're building
print_header "What are we building?"

echo "A High Availability (HA) Kubernetes cluster means:"
echo "  • Multiple master nodes (so if one fails, others keep working)"
echo "  • A load balancer to distribute traffic"
echo "  • Worker nodes to run your applications"
echo ""
echo "Think of it like a restaurant:"
echo "  🏢 Load Balancer = Host who directs customers"
echo "  👨‍💼 Masters = Managers who coordinate everything"
echo "  👨‍🍳 Workers = Chefs who do the actual cooking"
echo ""

read -p "Press Enter to continue..."
clear

print_header "Step 1: Understanding Your Setup"

echo "For a complete HA cluster, you need 7 machines:"
echo ""
echo "  1️⃣  Load Balancer    (1 machine)  - Routes traffic to masters"
echo "  2️⃣  Master Nodes     (3 machines) - Control the cluster"
echo "  3️⃣  Worker Nodes     (3 machines) - Run your applications"
echo ""
print_info "Your current machine:"
CURRENT_IP=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
HOSTNAME=$(hostname)
echo "  • IP: $CURRENT_IP"
echo "  • Hostname: $HOSTNAME"
echo ""

ask_question "How many machines do you have access to?"
echo "  a) Just this one (I'll help you set it up as a single-node cluster)"
echo "  b) 3 machines (I'll help you set up a basic HA setup)"
echo "  c) 7 machines (Perfect! Full HA setup)"
echo "  d) I don't know / I need to check"
echo ""
read -p "Enter your choice (a/b/c/d): " machine_count

case $machine_count in
    a)
        clear
        print_header "Single Machine Setup"
        print_warning "With 1 machine, we can't do High Availability (HA)"
        echo "But I can set up a single-node cluster for learning!"
        echo ""
        echo "This will:"
        echo "  ✓ Install Kubernetes on this machine"
        echo "  ✓ Let you practice and learn"
        echo "  ✗ No high availability (if this fails, everything stops)"
        echo ""
        read -p "Continue with single-node setup? (yes/no): " confirm
        if [[ $confirm != "yes" ]]; then
            print_info "Setup cancelled. Come back when you have more machines!"
            exit 0
        fi
        SETUP_TYPE="single"
        ;;
    b)
        clear
        print_header "3 Machine Setup"
        print_info "With 3 machines, we can set up:"
        echo "  • 1 Load Balancer"
        echo "  • 1 Master Node"
        echo "  • 1 Worker Node"
        echo ""
        print_warning "This gives basic redundancy but not full HA"
        echo ""
        read -p "Continue with 3-machine setup? (yes/no): " confirm
        if [[ $confirm != "yes" ]]; then
            print_info "Setup cancelled."
            exit 0
        fi
        SETUP_TYPE="basic"
        ;;
    c)
        clear
        print_header "Full HA Setup - Perfect!"
        print_info "With 7 machines, we can build a production-grade HA cluster!"
        echo ""
        SETUP_TYPE="full"
        ;;
    d)
        clear
        print_header "Let's Check Your Machines"
        echo "Let me help you figure out what you have."
        echo ""
        print_info "Ways to check:"
        echo "  1. If you're using cloud (AWS/GCP/Azure):"
        echo "     - Log into your cloud console"
        echo "     - Count your running VM instances"
        echo ""
        echo "  2. If you're using local VMs (VirtualBox/VMware):"
        echo "     - Open your VM manager"
        echo "     - Count running machines"
        echo ""
        echo "  3. If you're using physical servers:"
        echo "     - Count the machines you can SSH into"
        echo ""
        read -p "Press Enter when you've checked..."
        exec "$0"
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

clear
print_header "Step 2: What This Machine Will Be"

ask_question "What role should THIS machine (${CURRENT_IP}) have?"
echo ""
if [[ $SETUP_TYPE == "single" ]]; then
    echo "  1) All-in-one (Master + Worker)"
elif [[ $SETUP_TYPE == "basic" ]]; then
    echo "  1) Load Balancer"
    echo "  2) Master Node"
    echo "  3) Worker Node"
else
    echo "  1) Load Balancer"
    echo "  2) Master Node (1st master)"
    echo "  3) Master Node (2nd or 3rd master)"
    echo "  4) Worker Node"
fi
echo ""
read -p "Enter your choice: " role_choice

clear
print_header "Step 3: Let's Get Started!"

if [[ $SETUP_TYPE == "single" ]] || [[ $role_choice -ge 2 ]]; then
    print_step "1" "First, we need to install prerequisites"
    echo ""
    print_info "This will install:"
    echo "  • Docker (to run containers)"
    echo "  • kubeadm (to set up Kubernetes)"
    echo "  • kubelet (Kubernetes node agent)"
    echo "  • kubectl (command-line tool)"
    echo ""
    print_warning "This may take 5-10 minutes depending on your internet speed"
    echo ""
    read -p "Ready to install prerequisites? (yes/no): " install_prereq
    
    if [[ $install_prereq == "yes" ]]; then
        echo ""
        print_info "Starting installation..."
        
        # Run the setup helper script
        echo ""
        print_info "Launching the setup helper script..."
        echo ""
        exec ./setup-helper.sh
    else
        print_warning "Installation cancelled. Run this script again when ready!"
        exit 0
    fi
else
    # Load balancer setup
    print_info "Setting up Load Balancer..."
    echo ""
    print_warning "You'll need the IP addresses of your master nodes"
    echo ""
    read -p "Do you have the master node IPs ready? (yes/no): " has_ips
    
    if [[ $has_ips == "yes" ]]; then
        exec ./setup-helper.sh
    else
        print_info "Please gather your master node IPs first, then run:"
        echo ""
        echo "  ./setup-helper.sh"
        echo ""
    fi
fi
