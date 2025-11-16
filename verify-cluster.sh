#!/bin/bash

# HA K8s Cluster Verification Script
# This script helps verify the HA setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Get current IP
CURRENT_IP=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)

print_section "HA Kubernetes Cluster Verification"
echo ""
print_info "Current IP: $CURRENT_IP"
print_info "Current Hostname: $(hostname)"
echo ""

# Menu
echo "Select verification to perform:"
echo "1) Check cluster nodes status"
echo "2) Check all pods status"
echo "3) Verify etcd cluster health"
echo "4) Check HAProxy status"
echo "5) Test API server connectivity"
echo "6) Run full verification"
echo "7) Test HA failover (simulate master failure)"
echo "8) Exit"
echo ""
read -p "Enter your choice [1-8]: " choice

case $choice in
    1)
        print_section "Checking Cluster Nodes Status"
        kubectl get nodes -o wide
        echo ""
        print_info "Node count: $(kubectl get nodes --no-headers | wc -l)"
        print_info "Ready nodes: $(kubectl get nodes --no-headers | grep -c Ready)"
        ;;
        
    2)
        print_section "Checking All Pods Status"
        kubectl get pods --all-namespaces -o wide
        echo ""
        print_info "Total pods: $(kubectl get pods --all-namespaces --no-headers | wc -l)"
        print_info "Running pods: $(kubectl get pods --all-namespaces --no-headers | grep -c Running)"
        PENDING=$(kubectl get pods --all-namespaces --no-headers | grep -c Pending || true)
        FAILED=$(kubectl get pods --all-namespaces --no-headers | grep -c -E "Error|Failed|CrashLoopBackOff" || true)
        if [ "$PENDING" -gt 0 ]; then
            print_warning "Pending pods: $PENDING"
        fi
        if [ "$FAILED" -gt 0 ]; then
            print_error "Failed pods: $FAILED"
        fi
        ;;
        
    3)
        print_section "Verifying Etcd Cluster Health"
        if [ ! -f /etc/kubernetes/pki/etcd/ca.crt ]; then
            print_error "Not running on a master node or etcd certs not found!"
            exit 1
        fi
        
        print_info "Etcd endpoint health:"
        sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
            --cacert=/etc/kubernetes/pki/etcd/ca.crt \
            --cert=/etc/kubernetes/pki/etcd/peer.crt \
            --key=/etc/kubernetes/pki/etcd/peer.key \
            endpoint health
        
        echo ""
        print_info "Etcd cluster members:"
        sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
            --cacert=/etc/kubernetes/pki/etcd/ca.crt \
            --cert=/etc/kubernetes/pki/etcd/peer.crt \
            --key=/etc/kubernetes/pki/etcd/peer.key \
            member list
        ;;
        
    4)
        print_section "Checking HAProxy Status"
        if ! command -v haproxy &> /dev/null; then
            print_error "HAProxy is not installed on this node!"
            exit 1
        fi
        
        print_info "HAProxy service status:"
        sudo systemctl status haproxy --no-pager
        
        echo ""
        print_info "HAProxy is listening on:"
        sudo netstat -tlnp | grep haproxy || sudo ss -tlnp | grep haproxy
        
        echo ""
        print_info "HAProxy stats page: http://${CURRENT_IP}:8404"
        ;;
        
    5)
        print_section "Testing API Server Connectivity"
        read -p "Enter Load Balancer IP: " LB_IP
        
        print_info "Testing connection to https://${LB_IP}:6443/version"
        curl -k https://${LB_IP}:6443/version
        echo ""
        
        print_info "Testing connection to https://${LB_IP}:6443/healthz"
        curl -k https://${LB_IP}:6443/healthz
        echo ""
        ;;
        
    6)
        print_section "Running Full Verification"
        
        # Check nodes
        print_info "1. Checking cluster nodes..."
        kubectl get nodes
        echo ""
        
        # Check pods
        print_info "2. Checking system pods..."
        kubectl get pods -n kube-system
        echo ""
        
        # Check components
        print_info "3. Checking component status..."
        kubectl get cs 2>/dev/null || print_warning "Component status deprecated in recent versions"
        echo ""
        
        # Check deployments
        print_info "4. Checking system deployments..."
        kubectl get deployments -A
        echo ""
        
        # Check services
        print_info "5. Checking services..."
        kubectl get svc -A
        echo ""
        
        # Summary
        print_section "Verification Summary"
        TOTAL_NODES=$(kubectl get nodes --no-headers | wc -l)
        READY_NODES=$(kubectl get nodes --no-headers | grep -c Ready)
        TOTAL_PODS=$(kubectl get pods --all-namespaces --no-headers | wc -l)
        RUNNING_PODS=$(kubectl get pods --all-namespaces --no-headers | grep -c Running)
        
        echo "Nodes: ${READY_NODES}/${TOTAL_NODES} Ready"
        echo "Pods: ${RUNNING_PODS}/${TOTAL_PODS} Running"
        
        if [ "$READY_NODES" -eq "$TOTAL_NODES" ] && [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ]; then
            print_info "✓ Cluster is healthy!"
        else
            print_warning "⚠ Some components are not ready"
        fi
        ;;
        
    7)
        print_section "Testing HA Failover"
        print_warning "This will simulate a master node failure!"
        print_warning "This should only be run on ONE master node for testing."
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " confirm
        
        if [[ $confirm == "yes" ]]; then
            print_info "Current cluster state:"
            kubectl get nodes
            echo ""
            
            print_warning "Stopping kubelet and containerd on this node..."
            sudo systemctl stop kubelet
            sudo systemctl stop containerd || sudo systemctl stop docker
            
            print_info "Services stopped. Check cluster from another master node."
            print_warning "To restore this node, run:"
            echo "sudo systemctl start containerd"
            echo "sudo systemctl start kubelet"
        else
            print_info "Failover test cancelled."
        fi
        ;;
        
    8)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_info "Verification completed!"
