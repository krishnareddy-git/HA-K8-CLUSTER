# HA K8s Cluster Setup Checklist

## Node Inventory (Update with your actual IPs)
```
Load Balancer: <LB_IP>
Master 1: <MASTER1_IP>
Master 2: <MASTER2_IP>
Master 3: <MASTER3_IP>
Worker 1: <WORKER1_IP>
Worker 2: <WORKER2_IP>
Worker 3: <WORKER3_IP>
```

## Setup Progress

### Phase 1: Load Balancer Setup
- [ ] Install HAProxy on load balancer node
- [ ] Configure HAProxy with master node IPs
- [ ] Start HAProxy service
- [ ] Verify HAProxy is listening on port 6443

### Phase 2: Prepare All Nodes (Masters + Workers)
- [ ] Install Docker on all nodes
- [ ] Install kubeadm, kubelet, kubectl on all nodes
- [ ] Disable swap on all nodes
- [ ] Configure kernel parameters

### Phase 3: Initialize First Master Node
- [ ] Run kubeadm init with load balancer endpoint
- [ ] Set up kubeconfig
- [ ] Install Calico network plugin
- [ ] Install Ingress-NGINX controller
- [ ] Save join commands for masters and workers

### Phase 4: Join Additional Master Nodes
- [ ] Join Master 2
- [ ] Join Master 3
- [ ] Set up kubeconfig on each master

### Phase 5: Join Worker Nodes
- [ ] Join Worker 1
- [ ] Join Worker 2
- [ ] Join Worker 3

### Phase 6: Verification
- [ ] Check all nodes are Ready
- [ ] Check all pods are Running
- [ ] Verify etcd cluster health
- [ ] Test HAProxy failover

## Current Node
Your current IP: 172.16.0.4
Hostname: students
