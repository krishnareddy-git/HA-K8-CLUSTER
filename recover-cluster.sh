#!/bin/bash

echo "🔧 Kubernetes Cluster Recovery Script"
echo "======================================"
echo ""

echo "This will reset and rebuild your Kubernetes cluster properly."
echo "All previous configuration will be removed."
echo ""
read -p "Continue? (yes/no): " confirm

if [[ $confirm != "yes" ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Resetting kubeadm..."
sudo kubeadm reset -f

echo ""
echo "Step 2: Cleaning up..."
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube/config
sudo systemctl restart containerd

echo ""
echo "Step 3: Waiting for containerd to stabilize..."
sleep 5

echo ""
echo "Step 4: Initializing cluster with Flannel..."
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

echo ""
echo "Step 5: Setting up kubeconfig..."
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

echo ""
echo "Step 6: Installing Flannel network..."
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

echo ""
echo "Step 7: Removing master node taint (for single-node setup)..."
sleep 15
kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true

echo ""
echo "✅ Setup complete! Waiting for cluster to stabilize..."
echo ""
sleep 30

echo "=== CLUSTER STATUS ==="
kubectl get nodes
echo ""
kubectl get pods -A

echo ""
echo "🎉 Done! Your cluster should be ready in a few moments."
echo ""
echo "To check status, run:"
echo "  kubectl get nodes"
echo "  kubectl get pods -A"
