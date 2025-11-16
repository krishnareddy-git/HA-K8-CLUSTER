# 🚀 HA Kubernetes Cluster Dashboard

A modern, responsive web dashboard for visualizing and monitoring your High Availability Kubernetes cluster.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## ✨ Features

### 📊 Real-time Monitoring
- **Live Cluster Statistics**: Real-time updates of nodes, pods, services, and deployments
- **Auto-refresh**: Automatic data refresh every 5 seconds
- **Health Monitoring**: Comprehensive health checks for all cluster components

### 🎨 Modern UI/UX
- **Dark Theme**: Easy on the eyes with a professional dark interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Interactive Charts**: Visual representation of cluster health and resources

### 📈 Dashboard Pages

#### 1. Overview
- Cluster statistics at a glance
- Health status visualization
- Resource distribution charts
- Recent events timeline

#### 2. Nodes
- Complete list of cluster nodes
- Node status and health
- CPU and memory usage
- Kubernetes version information

#### 3. Pods
- All pods across namespaces
- Filter by namespace
- Search functionality
- Status indicators

#### 4. Services
- Service listings
- ClusterIP and port information
- Service type indicators

#### 5. Deployments
- Deployment status
- Replica counts
- Ready/Available states

#### 6. Health Check
- API Server status
- ETCD cluster health
- Controller Manager status
- Scheduler status
- System logs viewer

## 🚀 Quick Start

### Prerequisites
- Python 3 (for running the local server)
- A running Kubernetes cluster
- Web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Navigate to the dashboard directory:**
```bash
cd /home/student/Sainath/HA-K8-Cluster/dashboard
```

2. **Make the start script executable:**
```bash
chmod +x start-dashboard.sh
```

3. **Start the dashboard:**
```bash
./start-dashboard.sh
```

By default, the dashboard runs on port 8080. To use a different port:
```bash
./start-dashboard.sh 3000
```

4. **Open your browser:**
```
http://localhost:8080
```

## 📁 Project Structure

```
dashboard/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── dashboard.js        # Dashboard functionality
├── start-dashboard.sh  # Server start script
└── README.md          # This file
```

## 🎯 Usage Guide

### Navigation
- Use the **sidebar** to switch between different views
- Click the **refresh button** in the header to manually update data
- Check the **timestamp** to see when data was last updated

### Filtering & Search
- **Pods Page**: Filter by namespace using the dropdown
- **All Tables**: Use the search box to find specific resources
- Search works across all visible columns

### Auto-Refresh
- Dashboard automatically refreshes every 5 seconds
- Manual refresh available via the refresh button
- Live status indicator in the sidebar shows connection status

## 🔧 Customization

### Changing Refresh Interval
Edit `dashboard.js` and modify the `REFRESH_INTERVAL` constant:
```javascript
const REFRESH_INTERVAL = 5000; // milliseconds
```

### Connecting to Real Cluster Data

The dashboard currently uses simulated data. To connect to your actual Kubernetes cluster, you'll need to:

1. **Create a Backend API** (Node.js/Python/Go) that:
   - Executes `kubectl` commands
   - Returns JSON responses
   - Handles CORS if needed

2. **Update the fetch functions** in `dashboard.js`:
```javascript
async function fetchClusterData() {
    const response = await fetch('/api/cluster/overview');
    return await response.json();
}
```

### Example Backend Endpoints
```
GET /api/cluster/overview    - Cluster statistics
GET /api/nodes              - List all nodes
GET /api/pods               - List all pods
GET /api/services           - List all services
GET /api/deployments        - List all deployments
GET /api/health             - Health status
```

## 🎨 Color Scheme

The dashboard uses a modern dark theme with accent colors:

- **Primary**: `#326CE5` (Kubernetes Blue)
- **Secondary**: `#00D4FF` (Cyan)
- **Success**: `#00C851` (Green)
- **Warning**: `#FFB300` (Amber)
- **Error**: `#FF3547` (Red)
- **Background**: `#0F1419` (Dark)

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 🚦 Status Indicators

| Color | Meaning |
|-------|---------|
| 🟢 Green | Healthy/Running/Ready |
| 🟡 Yellow | Pending/Warning |
| 🔴 Red | Failed/Error |

## 🔐 Security Notes

- The dashboard is intended for **local development/monitoring**
- For production use, implement proper authentication
- Use HTTPS for secure connections
- Implement RBAC for Kubernetes API access
- Never expose the dashboard publicly without security measures

## 🛠️ Troubleshooting

### Dashboard won't start
```bash
# Check if port is already in use
sudo lsof -i :8080

# Try a different port
./start-dashboard.sh 3000
```

### Data not loading
- Ensure your Kubernetes cluster is running
- Check browser console for errors (F12)
- Verify network connectivity

### Styling issues
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Try a different browser

## 📝 Future Enhancements

- [ ] Real-time WebSocket connections
- [ ] Metrics visualization (CPU, Memory graphs)
- [ ] Log streaming
- [ ] Pod shell access
- [ ] Resource scaling controls
- [ ] Namespace management
- [ ] ConfigMap & Secret editor
- [ ] Event notifications
- [ ] Export/Download reports
- [ ] Dark/Light theme toggle

## 🤝 Contributing

Feel free to enhance the dashboard! Some ideas:
- Add more visualizations
- Improve responsive design
- Add keyboard shortcuts
- Implement filters and sorting
- Add export functionality

## 📄 License

MIT License - Feel free to use and modify for your projects!

## 🙏 Acknowledgments

- Kubernetes logo and design inspiration
- Font Awesome for icons
- Inter font family for typography

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify cluster connectivity

---

**Made with ❤️ for Kubernetes enthusiasts**

Happy Monitoring! 🎉
