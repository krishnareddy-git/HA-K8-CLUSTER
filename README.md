# HA Kubernetes Cluster Setup Project 🚀

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.30.0-blue.svg)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Project Overview

A complete **High Availability Kubernetes Cluster** setup with comprehensive automation scripts and documentation. This project demonstrates production-grade Kubernetes cluster deployment, management, and best practices.

### 🎯 What This Project Includes

- ✅ Automated cluster setup and recovery scripts
- ✅ Complete documentation for beginners and experts
- ✅ Interactive demonstration guides
- ✅ Health check and verification tools
- ✅ Daily operations management scripts
- ✅ High Availability architecture design

---

## 🏗️ Architecture

### Current Setup (Single-Node)
- 1 node acting as both control plane and worker
- Perfect for development, testing, and learning

### Production HA Setup (Scalable)
- **1 Load Balancer** (HAProxy) for traffic distribution
- **3 Master Nodes** for control plane redundancy
- **3 Worker Nodes** for application workloads
- **Total: 7 nodes** for complete high availability

---

## 🚀 Quick Start

### Prerequisites
- Linux OS (Ubuntu 22.04 recommended)
- 2GB+ RAM, 2+ CPU cores
- Root or sudo access
- Internet connection

### Option 1: One-Command Setup
```bash
./recover-cluster.sh
```
This will automatically:
- Install Docker, kubeadm, kubelet, kubectl
- Initialize Kubernetes cluster
- Install Flannel network plugin
- Configure single-node setup

### Option 2: Interactive Setup
```bash
./simple-setup.sh
```
Guided setup for:
- Load Balancer configuration
- Master node initialization
- Worker node joining

### Option 3: Beginner-Friendly Guide
```bash
./beginner-guide.sh
```
Step-by-step interactive guide for complete beginners.

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[START-HERE.md](START-HERE.md)** | Quick start guide |
| **[PRESENTATION-GUIDE.txt](PRESENTATION-GUIDE.txt)** | Complete demo guide with commands (663 lines) |
| **[QUICK-REFERENCE-CARD.txt](QUICK-REFERENCE-CARD.txt)** | Cheat sheet for quick reference |
| **[README-SETUP-TOOLKIT.md](README-SETUP-TOOLKIT.md)** | Complete setup toolkit overview |
| **[QUICK-SETUP-GUIDE.md](QUICK-SETUP-GUIDE.md)** | Step-by-step setup instructions |
| **[setup-checklist.md](setup-checklist.md)** | Progress tracking checklist |
| **[devops-shack-HA-K8-cluster.md](devops-shack-HA-K8-cluster.md)** | Original HA architecture guide |

---

## 🛠️ Available Scripts

### Setup & Recovery
| Script | Purpose | Usage |
|--------|---------|-------|
| `recover-cluster.sh` | Automated cluster setup/recovery | `./recover-cluster.sh` |
| `simple-setup.sh` | Interactive setup wizard | `./simple-setup.sh` |
| `setup-helper.sh` | Advanced multi-node setup | `./setup-helper.sh` |
| `beginner-guide.sh` | Beginner-friendly guide | `./beginner-guide.sh` |

### Operations & Management
| Script | Purpose | Usage |
|--------|---------|-------|
| `verify-cluster.sh` | Health checks & verification | `./verify-cluster.sh` |
| `k8s-operations.sh` | 20+ common operations menu | `./k8s-operations.sh` |
| `pre-presentation-check.sh` | Pre-demo readiness check | `./pre-presentation-check.sh` |

---

## 🎪 Live Demonstrations

### Demo 1: Self-Healing
```bash
kubectl create deployment demo --image=nginx --replicas=3
kubectl get pods
kubectl delete pod <pod-name>  # Kubernetes automatically recreates it!
```

### Demo 2: Scaling
```bash
kubectl scale deployment demo --replicas=10  # Scale up
kubectl scale deployment demo --replicas=2   # Scale down
```

### Demo 3: Zero-Downtime Updates
```bash
kubectl set image deployment/demo nginx=nginx:1.22  # Rolling update
kubectl rollout status deployment/demo
```

---

## 📊 Project Statistics

- **Documentation**: 2000+ lines
- **Scripts**: 7 automation scripts
- **Commands**: 50+ ready-to-use commands
- **Demos**: 10+ live demonstrations
- **Time to Setup**: 5-10 minutes

---

## 🎓 Learning Outcomes

By completing this project, you will learn:

- ✅ Kubernetes cluster architecture and components
- ✅ Container orchestration concepts
- ✅ High Availability design patterns
- ✅ Networking with CNI plugins (Flannel)
- ✅ Load balancing with HAProxy
- ✅ Cluster management and operations
- ✅ Troubleshooting and debugging
- ✅ Automation and scripting

---

## 🔧 Technologies Used

- **Kubernetes** v1.30.0 - Container orchestration
- **Docker** - Container runtime
- **Flannel** - Pod networking (CNI)
- **HAProxy** - Load balancing (HA setup)
- **etcd** - Distributed key-value store
- **CoreDNS** - Service discovery
- **Bash** - Automation scripting

---

## 📝 Common Commands

### Cluster Management
```bash
kubectl get nodes                 # View cluster nodes
kubectl get pods -A              # View all pods
kubectl cluster-info             # Cluster information
kubectl top nodes                # Resource usage
```

### Application Deployment
```bash
kubectl create deployment <name> --image=<image> --replicas=<n>
kubectl expose deployment <name> --port=80 --type=NodePort
kubectl scale deployment <name> --replicas=<n>
kubectl delete deployment <name>
```

### Troubleshooting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events
./verify-cluster.sh
```

---

## 🎯 Use Cases

### Development & Testing
- Local development environment
- Testing applications before production
- Learning Kubernetes concepts

### Education
- Teaching Kubernetes in workshops
- University projects and assignments
- Hands-on training sessions

### Production Planning
- Understanding HA architecture
- Capacity planning for production
- Disaster recovery testing

---

## 🚨 Troubleshooting

### Cluster Not Starting
```bash
./recover-cluster.sh  # Automated fix
```

### Connection Refused Error
```bash
sudo systemctl restart kubelet
sudo systemctl restart containerd
```

### Pods Stuck in Pending
```bash
kubectl describe pod <pod-name>  # Check for issues
kubectl get events               # View recent events
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest enhancements
- Submit pull requests
- Improve documentation

---

## 📞 Support

For questions or issues:
- Check the [PRESENTATION-GUIDE.txt](PRESENTATION-GUIDE.txt) for comprehensive explanations
- Review [START-HERE.md](START-HERE.md) for quick solutions
- Use [QUICK-REFERENCE-CARD.txt](QUICK-REFERENCE-CARD.txt) for command reference

---

## 🎉 Acknowledgments

- Based on DevOps Shack HA Kubernetes guide
- Kubernetes community documentation
- Open-source contributors

---

## 📜 License

This project is open source and available under the MIT License.

---

## 🌟 Star This Repository

If you found this project helpful, please consider giving it a star! ⭐

---

## 📬 Contact

**Author**: Krishna Reddy  
**GitHub**: [@krishnareddy-git](https://github.com/krishnareddy-git)  
**Repository**: [HA-K8-CLUSTER](https://github.com/krishnareddy-git/HA-K8-CLUSTER)

---

<div align="center">

### Made with ❤️ for the Kubernetes Community

**Happy Kubernetes-ing!** 🚀

</div>
