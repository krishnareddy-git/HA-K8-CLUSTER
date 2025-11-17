#!/bin/bash

# Test Real Kubernetes Monitoring
# This script demonstrates real K8s operations being logged

echo "========================================="
echo " Testing Real K8s Monitoring System"
echo "========================================="
echo ""

# Check if cluster is running
echo "🔍 Checking cluster status..."
if ! kubectl get nodes &> /dev/null; then
    echo "❌ Kubernetes cluster is not running!"
    echo ""
    echo "Please start your cluster first:"
    echo "  cd /home/student/Sainath/HA-K8-Cluster"
    echo "  ./simple-setup.sh"
    echo ""
    exit 1
fi

echo "✅ Cluster is running!"
echo ""

# Check if dashboards are running
echo "🔍 Checking if dashboards are running..."
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "⚠️  Dashboards not running. Starting them..."
    ./start-all-dashboards.sh &
    sleep 3
    echo "✅ Dashboards started!"
else
    echo "✅ Dashboards already running!"
fi

echo ""
echo "========================================="
echo " Running Test Operations"
echo "========================================="
echo ""

# Test 1: Create a deployment
echo "Test 1: Creating nginx deployment..."
kubectl create deployment nginx-test --image=nginx:latest 2>/dev/null || echo "  (Already exists, that's OK)"
echo "  → Check logs for: 'Deployment created: nginx-test'"
sleep 3

# Test 2: Scale the deployment
echo ""
echo "Test 2: Scaling to 3 replicas..."
kubectl scale deployment nginx-test --replicas=3 2>/dev/null
echo "  → Check logs for: 'replicas 1 → 3'"
sleep 3

# Test 3: Create a service
echo ""
echo "Test 3: Exposing as service..."
kubectl expose deployment nginx-test --port=80 --type=ClusterIP 2>/dev/null || echo "  (Service exists)"
echo "  → Check logs for: 'Service created: nginx-test'"
sleep 3

# Test 4: Scale down
echo ""
echo "Test 4: Scaling down to 2 replicas..."
kubectl scale deployment nginx-test --replicas=2 2>/dev/null
echo "  → Check logs for: 'replicas 3 → 2'"
sleep 3

# Show current state
echo ""
echo "========================================="
echo " Current Cluster State"
echo "========================================="
echo ""
echo "Deployments:"
kubectl get deployments | grep nginx-test || echo "  None"
echo ""
echo "Pods:"
kubectl get pods | grep nginx-test || echo "  None"
echo ""
echo "Services:"
kubectl get services | grep nginx-test || echo "  None"

echo ""
echo "========================================="
echo " 🎯 What to Check in Log Viewer"
echo "========================================="
echo ""
echo "Open: http://localhost:8082/log-viewer.html"
echo ""
echo "You should see these logs:"
echo "  ✅ Deployment created: nginx-test"
echo "  ℹ️  Deployment nginx-test: replicas 1 → 3"
echo "  ✅ Pod created: nginx-test-xxxxx"
echo "  ✅ Service created: nginx-test"
echo "  ℹ️  Deployment nginx-test: replicas 3 → 2"
echo ""
echo "Filter by source: 'K8s Monitor' to see only cluster changes!"
echo ""
echo "========================================="
echo ""
echo "To clean up test resources:"
echo "  kubectl delete deployment nginx-test"
echo "  kubectl delete service nginx-test"
echo ""
