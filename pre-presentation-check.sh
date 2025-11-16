#!/bin/bash

# Pre-Presentation Quick Check & Startup Script
# Run this BEFORE your presentation to ensure everything works!

echo "🎯 PRE-PRESENTATION CHECKLIST"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "Step 1: Checking if cluster is running..."
if kubectl get nodes &> /dev/null; then
    check_pass "Cluster is responding"
    kubectl get nodes
else
    check_fail "Cluster is not responding"
    echo ""
    read -p "Would you like me to start the cluster now? (yes/no): " start_cluster
    
    if [[ $start_cluster == "yes" ]]; then
        echo ""
        echo "Starting cluster... (this takes ~3-5 minutes)"
        ./recover-cluster.sh
    else
        echo ""
        echo "Please run: ./recover-cluster.sh"
        echo "Then run this script again."
        exit 1
    fi
fi

echo ""
echo "Step 2: Checking system pods..."
PENDING=$(kubectl get pods -n kube-system --no-headers 2>/dev/null | grep -c Pending || echo "0")
RUNNING=$(kubectl get pods -n kube-system --no-headers 2>/dev/null | grep -c Running || echo "0")

if [ "$RUNNING" -gt 5 ]; then
    check_pass "System pods are running ($RUNNING pods)"
else
    check_warn "Only $RUNNING system pods running. Cluster may still be starting..."
fi

if [ "$PENDING" -gt 0 ]; then
    check_warn "$PENDING pods are still pending"
fi

echo ""
echo "Step 3: Cleaning up old demo resources..."
kubectl delete deployment nginx-demo hello-k8s 2>/dev/null && check_pass "Cleaned old deployments" || check_pass "No old deployments to clean"
kubectl delete service nginx-demo 2>/dev/null && check_pass "Cleaned old services" || check_pass "No old services to clean"

echo ""
echo "Step 4: Testing a quick deployment..."
kubectl create deployment test-check --image=nginx --replicas=1 &> /dev/null
sleep 5

if kubectl get deployment test-check &> /dev/null; then
    check_pass "Test deployment successful"
    kubectl delete deployment test-check &> /dev/null
    check_pass "Test deployment cleaned up"
else
    check_warn "Test deployment had issues (cluster might still be starting)"
fi

echo ""
echo "Step 5: Checking network plugin..."
if kubectl get pods -n kube-flannel &> /dev/null; then
    check_pass "Flannel network plugin is installed"
else
    check_warn "Network plugin status unclear"
fi

echo ""
echo "Step 6: Resource check..."
echo "Current resource usage:"
kubectl top nodes 2>/dev/null || check_warn "Metrics not available yet (normal for new clusters)"

echo ""
echo "=========================================="
echo "📋 PRESENTATION READINESS CHECK"
echo "=========================================="
echo ""

# Final check
if kubectl get nodes | grep -q "Ready"; then
    echo -e "${GREEN}✓ YOUR CLUSTER IS READY FOR PRESENTATION!${NC}"
    echo ""
    echo "Quick reference for your demo:"
    echo ""
    echo "1. Show cluster status:"
    echo "   kubectl get nodes"
    echo ""
    echo "2. Show system components:"
    echo "   kubectl get pods -n kube-system"
    echo ""
    echo "3. Deploy demo app:"
    echo "   kubectl create deployment nginx-demo --image=nginx --replicas=3"
    echo ""
    echo "4. Check deployment:"
    echo "   kubectl get pods"
    echo ""
    echo "📖 Full guide: cat PRESENTATION-GUIDE.txt"
    echo ""
else
    echo -e "${YELLOW}⚠ CLUSTER NEEDS MORE TIME${NC}"
    echo ""
    echo "The cluster is starting but not fully ready yet."
    echo "Wait 2-3 minutes and run this script again:"
    echo "   ./pre-presentation-check.sh"
fi

echo ""
echo "=========================================="
echo "🎯 FILES FOR YOUR PRESENTATION"
echo "=========================================="
echo ""
ls -lh PRESENTATION-GUIDE.txt EXPLAIN-TO-FRIENDS.txt START-HERE.md 2>/dev/null
echo ""
echo "💡 TIP: Keep PRESENTATION-GUIDE.txt open during demo!"
echo ""
