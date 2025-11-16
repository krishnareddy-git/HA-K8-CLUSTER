# Quick Setup Guide - HA Kubernetes Cluster

## 🎯 Overview
This guide helps you set up a **High Availability Kubernetes Cluster** with:
- **3 Master Nodes** (Control Plane)
- **3 Worker Nodes**
- **1 Load Balancer** (HAProxy)

## 📋 Prerequisites
- 7 Linux machines (Ubuntu recommended)
- All nodes should be able to communicate with each other
- Root or sudo access on all nodes
- At least 2GB RAM per node, 2 CPUs

## 🚀 Quick Start

### Step 1: Prepare Your Node Inventory
Update your IP addresses:
```
Load Balancer: <LB_IP>
Master 1: <MASTER1_IP>
Master 2: <MASTER2_IP>
Master 3: <MASTER3_IP>
Worker 1: <WORKER1_IP>
Worker 2: <WORKER2_IP>
Worker 3: <WORKER3_IP>
```

### Step 2: Use the Setup Helper Script

#### On ALL nodes (Masters + Workers):
```bash
cd /home/student/Sainath/HA-K8-Cluster
./setup-helper.sh
# Choose option 4: Install prerequisites
```

#### On Load Balancer node:
```bash
./setup-helper.sh
# Choose option 1: Load Balancer (HAProxy)
# Enter all 3 master IPs when prompted
```

#### On Master 1 (First Master):
```bash
./setup-helper.sh
# Choose option 2: Master Node
# Answer 'y' when asked if this is the first master
# Follow the displayed commands to:
#   1. Initialize the cluster
#   2. Set up kubeconfig
#   3. Install Calico network
#   4. Install Ingress controller
# SAVE the join commands!
```

#### On Master 2 & Master 3:
```bash
./setup-helper.sh
# Choose option 2: Master Node
# Answer 'n' when asked if this is the first master
# Follow the displayed instructions
```

#### On All Worker Nodes:
```bash
./setup-helper.sh
# Choose option 3: Worker Node
# Follow the displayed instructions
```

### Step 3: Verify the Cluster

On any master node:
```bash
./verify-cluster.sh
# Choose option 6: Run full verification
```

## 📝 Manual Commands Reference

### Initialize First Master (if not using script):
```bash
sudo kubeadm init --control-plane-endpoint "<LB_IP>:6443" --upload-certs --pod-network-cidr=10.244.0.0/16

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.49.0/deploy/static/provider/baremetal/deploy.yaml
```

### Get Join Command for Additional Masters:
```bash
kubeadm token create --print-join-command --certificate-key $(kubeadm init phase upload-certs --upload-certs | tail -1)
```

### Get Join Command for Workers:
```bash
kubeadm token create --print-join-command
```

### Check Cluster Status:
```bash
kubectl get nodes
kubectl get pods --all-namespaces
```

### Check Etcd Health (on master nodes):
```bash
sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/peer.crt \
  --key=/etc/kubernetes/pki/etcd/peer.key \
  endpoint health
```

### Check HAProxy Stats:
```bash
# Access in browser:
http://<LB_IP>:8404
```

## 🔧 Troubleshooting

### Issue: Nodes not joining cluster
```bash
# Reset node and try again
sudo kubeadm reset
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube/config
```

### Issue: Pods not starting
```bash
# Check pod logs
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Issue: HAProxy not routing
```bash
# Check HAProxy status
sudo systemctl status haproxy
sudo journalctl -u haproxy -f
```

### Issue: Network issues
```bash
# Check firewall rules
sudo ufw status
# Make sure ports are open: 6443, 2379-2380, 10250-10252
```

## 📊 Expected Results

After successful setup, you should see:
```bash
$ kubectl get nodes
NAME       STATUS   ROLES           AGE   VERSION
master1    Ready    control-plane   10m   v1.30.0
master2    Ready    control-plane   8m    v1.30.0
master3    Ready    control-plane   6m    v1.30.0
worker1    Ready    <none>          4m    v1.30.0
worker2    Ready    <none>          3m    v1.30.0
worker3    Ready    <none>          2m    v1.30.0
```

## 🎓 Testing High Availability

To test HA:
1. Stop kubelet on one master node
2. Verify cluster still responds
3. Check HAProxy routes to healthy masters

```bash
# On Master 1 (to simulate failure):
sudo systemctl stop kubelet

# On Master 2 or 3:
kubectl get nodes
# Master 1 should show NotReady, but cluster still works

# To restore Master 1:
sudo systemctl start kubelet
```

## 📚 Files Created

- `setup-helper.sh` - Interactive setup script
- `verify-cluster.sh` - Verification and testing script  
- `setup-checklist.md` - Progress tracking checklist
- `QUICK-SETUP-GUIDE.md` - This file

## 🔗 Useful Resources

- Original guide: `devops-shack-HA-K8-cluster.md`
- Kubernetes docs: https://kubernetes.io/docs/
- Calico docs: https://docs.projectcalico.org/
- HAProxy docs: https://www.haproxy.org/

## ⚠️ Important Notes

1. **Swap must be disabled** on all nodes
2. **All nodes must have unique hostnames and MAC addresses**
3. **Network connectivity** between all nodes is required
4. **Time synchronization** (NTP) should be configured
5. **Firewall rules** must allow required ports

## 🎉 Next Steps

After cluster is set up:
1. Deploy sample applications
2. Set up persistent storage
3. Configure monitoring (Prometheus/Grafana)
4. Set up logging (ELK/Loki)
5. Implement backup strategies
