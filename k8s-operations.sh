#!/bin/bash

# Common K8s Operations Script
# Quick commands for managing your HA Kubernetes cluster

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header "HA Kubernetes Cluster - Common Operations"
echo ""
echo "1)  View all nodes"
echo "2)  View all pods in all namespaces"
echo "3)  View system pods (kube-system)"
echo "4)  View services in all namespaces"
echo "5)  View deployments in all namespaces"
echo "6)  Get cluster info"
echo "7)  Describe a node"
echo "8)  Describe a pod"
echo "9)  Get pod logs"
echo "10) Check events"
echo "11) Deploy nginx test pod"
echo "12) Delete nginx test pod"
echo "13) Create a deployment"
echo "14) Scale a deployment"
echo "15) Get persistent volumes"
echo "16) Get storage classes"
echo "17) Drain a node (maintenance)"
echo "18) Uncordon a node"
echo "19) Top nodes (resource usage)"
echo "20) Top pods (resource usage)"
echo "21) Exit"
echo ""
read -p "Enter your choice [1-21]: " choice

case $choice in
    1)
        kubectl get nodes -o wide
        ;;
    2)
        kubectl get pods --all-namespaces -o wide
        ;;
    3)
        kubectl get pods -n kube-system -o wide
        ;;
    4)
        kubectl get svc --all-namespaces
        ;;
    5)
        kubectl get deployments --all-namespaces
        ;;
    6)
        kubectl cluster-info
        echo ""
        kubectl version --short
        ;;
    7)
        read -p "Enter node name: " node_name
        kubectl describe node $node_name
        ;;
    8)
        read -p "Enter pod name: " pod_name
        read -p "Enter namespace (default: default): " namespace
        namespace=${namespace:-default}
        kubectl describe pod $pod_name -n $namespace
        ;;
    9)
        read -p "Enter pod name: " pod_name
        read -p "Enter namespace (default: default): " namespace
        namespace=${namespace:-default}
        read -p "Follow logs? (y/n): " follow
        if [[ $follow == "y" ]]; then
            kubectl logs -f $pod_name -n $namespace
        else
            kubectl logs $pod_name -n $namespace
        fi
        ;;
    10)
        read -p "All namespaces? (y/n): " all_ns
        if [[ $all_ns == "y" ]]; then
            kubectl get events --all-namespaces --sort-by='.lastTimestamp'
        else
            kubectl get events --sort-by='.lastTimestamp'
        fi
        ;;
    11)
        print_info "Deploying nginx test pod..."
        kubectl run nginx-test --image=nginx --port=80
        echo ""
        print_info "Exposing as NodePort service..."
        kubectl expose pod nginx-test --type=NodePort --port=80
        echo ""
        print_info "Test deployment complete!"
        kubectl get pod nginx-test
        kubectl get svc nginx-test
        ;;
    12)
        print_info "Deleting nginx test pod and service..."
        kubectl delete pod nginx-test
        kubectl delete svc nginx-test
        print_info "Cleanup complete!"
        ;;
    13)
        read -p "Enter deployment name: " deploy_name
        read -p "Enter image (e.g., nginx:latest): " image
        read -p "Enter replicas (default: 3): " replicas
        replicas=${replicas:-3}
        read -p "Enter namespace (default: default): " namespace
        namespace=${namespace:-default}
        
        kubectl create deployment $deploy_name --image=$image --replicas=$replicas -n $namespace
        print_info "Deployment created!"
        kubectl get deployment $deploy_name -n $namespace
        ;;
    14)
        read -p "Enter deployment name: " deploy_name
        read -p "Enter namespace (default: default): " namespace
        namespace=${namespace:-default}
        read -p "Enter number of replicas: " replicas
        
        kubectl scale deployment $deploy_name --replicas=$replicas -n $namespace
        print_info "Deployment scaled!"
        kubectl get deployment $deploy_name -n $namespace
        ;;
    15)
        kubectl get pv
        echo ""
        kubectl get pvc --all-namespaces
        ;;
    16)
        kubectl get storageclass
        ;;
    17)
        read -p "Enter node name to drain: " node_name
        read -p "This will evict all pods from the node. Continue? (yes/no): " confirm
        if [[ $confirm == "yes" ]]; then
            kubectl drain $node_name --ignore-daemonsets --delete-emptydir-data
            print_info "Node drained. Don't forget to uncordon when maintenance is complete!"
        fi
        ;;
    18)
        read -p "Enter node name to uncordon: " node_name
        kubectl uncordon $node_name
        print_info "Node uncordoned and ready to schedule pods!"
        ;;
    19)
        kubectl top nodes
        ;;
    20)
        read -p "All namespaces? (y/n): " all_ns
        if [[ $all_ns == "y" ]]; then
            kubectl top pods --all-namespaces
        else
            kubectl top pods
        fi
        ;;
    21)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac
