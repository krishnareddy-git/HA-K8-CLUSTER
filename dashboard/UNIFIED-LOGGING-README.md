# Unified Logging System for K8s Dashboard

## 🎯 Overview

This unified logging system provides **real-time, cross-dashboard logging** for your Kubernetes HA Cluster project. All interactions and events from both the Main Dashboard and Load Balancer Demo are captured and displayed in a centralized Log Viewer.

## ✨ Features

### 🔄 Cross-Dashboard Logging
- **Unified logger** works across all dashboard components
- Logs from Main Dashboard and Load Balancer Demo appear in one place
- Real-time log streaming with automatic updates

### 💾 Persistent Storage
- Logs are saved to browser's localStorage
- Survives page refreshes and browser restarts
- Configurable log retention (default: 500 entries)

### 🔍 Advanced Filtering
- **Filter by Level**: Info, Success, Warning, Error
- **Filter by Source**: Dashboard, Load Balancer, System
- **Full-text Search**: Find specific log entries instantly
- Quick action buttons for common filters

### 📊 Statistics Dashboard
- Total log count and recent activity
- Breakdown by log level and source
- Visual indicators for errors and warnings

### 💫 Interactive Features
- Auto-scroll toggle for following live logs
- Pause/Resume logging without losing data
- Export logs to JSON for external analysis
- Keyboard shortcuts for power users
- Color-coded log levels for quick scanning

## 🚀 Quick Start

### Option 1: Automated Launcher (Recommended)

```bash
cd /home/student/Sainath/HA-K8-Cluster/dashboard
./start-all-dashboards.sh
```

This will start:
- Main Dashboard on http://localhost:8080
- Load Balancer Demo on http://localhost:8081  
- Unified Log Viewer on http://localhost:8082

### Option 2: Manual Start

```bash
cd /home/student/Sainath/HA-K8-Cluster/dashboard

# Start a simple HTTP server
python3 -m http.server 8080
```

Then open in your browser:
- Main Dashboard: `http://localhost:8080/index.html`
- Load Balancer Demo: `http://localhost:8080/load-balancing-demo.html`
- Log Viewer: `http://localhost:8080/log-viewer.html`

### Stop All Dashboards

```bash
./stop-all-dashboards.sh
```

## 📖 Usage Guide

### Best Practices for Viewing Logs

**Recommended Setup:**
1. Open Log Viewer in a **separate browser window**
2. Position it side-by-side with your dashboards
3. This way you can see logs in real-time as you interact with dashboards!

**Alternative Setup:**
1. Use browser tabs and switch between them
2. Keep Log Viewer in a pinned tab for quick access

### Understanding Log Entries

Each log entry shows:
```
[Time] [Level Icon] [Source] [Message] [Metadata]
```

**Log Levels:**
- 🔵 **Info** - General information (blue)
- ✅ **Success** - Successful operations (green)
- ⚠️ **Warning** - Warnings or alerts (orange)
- ❌ **Error** - Errors and failures (red)

**Log Sources:**
- **dashboard** - Events from the main K8s dashboard
- **loadbalancer** - Events from the load balancer demo
- **system** - System-level events (log viewer itself)

### Using Filters

**Source Filter:**
- `All Sources` - Show everything
- `Dashboard` - Only main dashboard events
- `Load Balancer` - Only LB demo events
- `System` - Only system events

**Level Filter:**
- `All Levels` - Show all log levels
- `Info` - Show only informational logs
- `Success` - Show only successful operations
- `Warning` - Show only warnings
- `Error` - Show only errors

**Search:**
- Type any text to filter logs by content
- Searches through both message and source
- Updates in real-time as you type

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search box |
| `Ctrl/Cmd + L` | Clear all logs |
| `Space` | Pause/Resume logging |
| `Escape` | Clear all filters |

## 🧪 Testing the System

### Test Load Balancer Logging

1. Open Load Balancer Demo
2. Open Log Viewer in another window
3. In LB Demo, click "Send Request"
4. Watch logs appear in Log Viewer showing:
   - Request routing
   - Pod selection
   - Response times
   - Algorithm changes

### Test Dashboard Logging

1. Open Main Dashboard
2. Open Log Viewer in another window
3. Navigate between pages (Nodes, Pods, Services)
4. Refresh data
5. Watch logs showing:
   - Page navigation
   - Data fetching
   - Successful loads
   - Any errors

### Test Filtering

1. Generate various types of logs from both dashboards
2. Use the filters to narrow down:
   - Show only Load Balancer logs
   - Show only Errors
   - Search for "request" or "pod"

## 🎨 Customization

### Adding Logs in Your Code

The unified logger is globally available. Use it anywhere in your dashboards:

```javascript
// Simple logging
unifiedLogger.info('Something happened', 'dashboard');
unifiedLogger.success('Operation completed!', 'dashboard');
unifiedLogger.warning('Be careful!', 'dashboard');
unifiedLogger.error('Something went wrong!', 'dashboard');

// Or use the convenience functions
logInfo('Info message', 'dashboard');
logSuccess('Success message', 'dashboard');
logWarning('Warning message', 'dashboard');
logError('Error message', 'dashboard');

// With metadata
unifiedLogger.log('info', 'Custom event', 'dashboard', {
    userId: 123,
    action: 'click',
    details: 'Button clicked'
});
```

### Log Metadata

You can attach additional data to logs:

```javascript
unifiedLogger.success('Request completed', 'loadbalancer', {
    podId: 2,
    responseTime: 45,
    algorithm: 'round-robin'
});
```

Click the metadata icon (ℹ️) in the log viewer to see this data.

## 📦 File Structure

```
dashboard/
├── unified-logger.js          # Core logging system
├── log-viewer.html            # Log viewer interface
├── log-viewer.js              # Log viewer functionality
├── log-viewer-styles.css      # Log viewer styling
├── start-all-dashboards.sh    # Launch script
├── stop-all-dashboards.sh     # Stop script
├── index.html                 # Main dashboard (updated)
├── dashboard.js               # Main dashboard JS (updated)
├── load-balancing-demo.html   # LB demo (updated)
└── lb-demo.js                 # LB demo JS (updated)
```

## 🔧 Advanced Features

### Export Logs

Click the download button or use:
```javascript
unifiedLogger.exportLogs();
```

This downloads a JSON file with all logs for external analysis.

### Get Statistics

```javascript
const stats = unifiedLogger.getStats();
console.log(stats);
// {
//   total: 150,
//   lastHour: 45,
//   byLevel: { info: 80, success: 50, warning: 15, error: 5 },
//   bySource: { dashboard: 100, loadbalancer: 45, system: 5 }
// }
```

### Clear Logs

```javascript
unifiedLogger.clearLogs();
```

### Programmatic Filtering

```javascript
unifiedLogger.setFilter('level', 'error');
unifiedLogger.setFilter('source', 'loadbalancer');
unifiedLogger.setFilter('search', 'pod');
unifiedLogger.clearFilters();
```

## 🐛 Troubleshooting

### Logs not appearing?

1. **Check if unified-logger.js is loaded:**
   ```javascript
   console.log(window.unifiedLogger);
   ```
   Should show the logger object.

2. **Check localStorage:**
   ```javascript
   console.log(localStorage.getItem('k8s-dashboard-logs'));
   ```

3. **Clear localStorage if needed:**
   ```javascript
   localStorage.removeItem('k8s-dashboard-logs');
   location.reload();
   ```

### Browser compatibility

- Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- Requires localStorage support
- Requires ES6+ JavaScript

### localStorage quota exceeded?

The logger automatically handles this by:
- Limiting to 500 most recent logs
- Auto-trimming when quota is reached
- You can manually clear: `unifiedLogger.clearLogs()`

## 💡 Tips & Tricks

1. **Multi-Monitor Setup**: Open log viewer on second monitor while using dashboards on primary

2. **Development**: Keep log viewer open while developing to catch errors immediately

3. **Presentations**: Show log viewer during demos to make interactions visible

4. **Debugging**: Use error filter to quickly find problems

5. **Performance**: Pause logging when testing heavy operations to prevent UI slowdown

6. **History**: Logs persist across sessions - great for reviewing past events

## 🎓 Learning Points

This implementation demonstrates:
- **Observer Pattern**: Subscribers listen for log events
- **LocalStorage API**: Persistent data storage
- **Event Broadcasting**: Cross-window communication via shared storage
- **Filtering & Search**: Real-time data filtering
- **Responsive Design**: Works on various screen sizes
- **Modular Architecture**: Reusable logging component

## 🤝 Integration

To integrate this logging system into new dashboard components:

1. **Include the logger:**
   ```html
   <script src="unified-logger.js"></script>
   ```

2. **Use it in your code:**
   ```javascript
   unifiedLogger.info('Component loaded', 'mycomponent');
   ```

3. **That's it!** The log viewer automatically picks up all logs.

## 📈 Future Enhancements

Potential improvements:
- WebSocket support for multi-user logging
- Log aggregation from backend services
- Advanced analytics and charts
- Log grouping and collapsing
- Custom log level definitions
- Integration with monitoring tools (Prometheus, Grafana)

## 📝 License

Part of the HA-K8-Cluster project.

---

**Happy Logging! 📊🎉**

For questions or issues, check the main project README or documentation.
