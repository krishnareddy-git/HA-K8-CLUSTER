# 🎯 HA Kubernetes Cluster - Setup Complete!

## 📦 What Has Been Prepared

I've created a complete setup toolkit for your High Availability Kubernetes cluster based on the DevOps Shack guide. Here's what you have:

### 📄 Files Created

1. **setup-helper.sh** ⭐ MAIN SETUP SCRIPT
   - Interactive script to set up each node type
   - Handles Load Balancer, Master, and Worker node setup
   - Installs all prerequisites automatically

2. **verify-cluster.sh** ✅ VERIFICATION SCRIPT
   - Check cluster health
   - Verify etcd cluster
   - Test HAProxy functionality
   - Simulate failover scenarios

3. **k8s-operations.sh** 🛠️ DAILY OPERATIONS
   - 20+ common Kubernetes operations
   - Deploy/manage applications
   - Monitor resources
   - Manage nodes

4. **QUICK-SETUP-GUIDE.md** 📖 COMPLETE GUIDE
   - Step-by-step instructions
   - Troubleshooting tips
   - Expected results
   - Manual commands reference

5. **setup-checklist.md** ☑️ PROGRESS TRACKER
   - Track your setup progress
   - Ensure no steps are missed

## 🚀 Getting Started

### Your Current System
- **IP Address:** 172.16.0.4
- **Hostname:** students
- **OS:** Linux

### Step 1: Determine Node Roles

First, you need to decide which machines will be:
- Load Balancer (1 machine)
- Master nodes (3 machines)
- Worker nodes (3 machines)

**Total: 7 machines required**

### Step 2: Start Setup

#### On Each Node, Run:
```bash
cd /home/student/Sainath/HA-K8-Cluster
./setup-helper.sh
```

Follow the interactive prompts based on the node type.

### Step 3: Setup Order

1. **First**: Install prerequisites on ALL nodes (Option 4)
2. **Second**: Set up Load Balancer node (Option 1)
3. **Third**: Initialize first Master node (Option 2)
4. **Fourth**: Join remaining Master nodes (Option 2)
5. **Fifth**: Join all Worker nodes (Option 3)

### Step 4: Verify

```bash
./verify-cluster.sh
# Choose option 6 for full verification
```

## 📋 Quick Command Reference

### Setup Commands
```bash
# Setup any node type
./setup-helper.sh

# Verify cluster
./verify-cluster.sh

# Manage cluster operations
./k8s-operations.sh
```

### Manual Verification
```bash
# Check nodes
kubectl get nodes

# Check pods
kubectl get pods --all-namespaces

# Check cluster info
kubectl cluster-info
```

## 🏗️ Architecture Overview

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │    (HAProxy)    │
                    │   Port: 6443    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Master1 │    │ Master2 │    │ Master3 │
        │  etcd   │────│  etcd   │────│  etcd   │
        └─────────┘    └─────────┘    └─────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Worker1 │    │ Worker2 │    │ Worker3 │
        └─────────┘    └─────────┘    └─────────┘
```

## 🔑 Key Features

✅ **High Availability**: 3 master nodes ensure cluster survives master failures
✅ **Load Balancing**: HAProxy distributes API requests across masters
✅ **Automated Scripts**: Easy setup with interactive scripts
✅ **Verification Tools**: Built-in health checks and testing
✅ **Production Ready**: Includes Calico networking and Ingress controller

## ⚠️ Important Prerequisites

Before starting, ensure:
- [ ] You have 7 Linux machines (Ubuntu recommended)
- [ ] All machines can communicate with each other
- [ ] You have root/sudo access on all machines
- [ ] Each machine has at least 2GB RAM, 2 CPUs
- [ ] All machines have unique hostnames
- [ ] Swap is disabled on all nodes

## 🎓 What You'll Learn

By setting up this cluster, you'll gain experience with:
- Kubernetes High Availability concepts
- Load balancing with HAProxy
- etcd cluster management
- Container networking (Calico)
- Kubernetes operators and controllers
- Production-grade cluster architecture

## 📊 Expected Timeline

- Prerequisites installation: ~10 minutes per node
- Load Balancer setup: ~5 minutes
- First master initialization: ~10 minutes
- Additional masters: ~5 minutes each
- Workers joining: ~3 minutes each
- **Total: ~45-60 minutes** (excluding machine provisioning)

## 🆘 Need Help?

### Common Issues

1. **Nodes won't join**: Check network connectivity and firewall rules
2. **Pods not starting**: Check container runtime (Docker) is running
3. **HAProxy issues**: Verify master IPs in configuration
4. **Etcd errors**: Ensure time is synchronized across all masters

### Useful Commands

```bash
# Reset a node if needed
sudo kubeadm reset

# Check logs
journalctl -u kubelet -f
journalctl -u docker -f

# Check pod details
kubectl describe pod <pod-name> -n <namespace>

# Get more details about errors
kubectl get events --sort-by='.lastTimestamp'
```

## 🎉 Next Steps After Setup

Once your cluster is running:

1. **Deploy Sample App**: Test with nginx
   ```bash
   ./k8s-operations.sh
   # Choose option 11 (Deploy nginx test pod)
   ```

2. **Set Up Monitoring**: Install Prometheus & Grafana
3. **Configure Persistent Storage**: Set up storage classes
4. **Implement CI/CD**: Connect with Jenkins/GitLab
5. **Security Hardening**: RBAC, Network Policies, Pod Security

## 📚 Additional Resources

- Original Guide: `devops-shack-HA-K8-cluster.md`
- Quick Setup: `QUICK-SETUP-GUIDE.md`
- Progress Tracker: `setup-checklist.md`
- Kubernetes Docs: https://kubernetes.io/docs/
- Calico Docs: https://docs.projectcalico.org/

## 💡 Tips for Success

1. **Document your IPs**: Keep a list of all node IPs handy
2. **One step at a time**: Don't rush, verify each step
3. **Save join commands**: You'll need them for workers
4. **Test as you go**: Run verification after each major step
5. **Take snapshots**: If using VMs, snapshot after successful steps

---

**Ready to start? Run `./setup-helper.sh` on your first node!**

Good luck with your HA Kubernetes cluster setup! 🚀
