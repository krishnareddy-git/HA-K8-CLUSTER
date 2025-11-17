#!/bin/bash

# Stop All Dashboards

echo "🛑 Stopping all dashboard instances..."

if [ -f /tmp/k8s-dashboard-pids.txt ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
            echo "   Stopped process $pid"
        fi
    done < /tmp/k8s-dashboard-pids.txt
    rm /tmp/k8s-dashboard-pids.txt
    echo "✅ All dashboards stopped successfully!"
else
    echo "ℹ️  No running dashboard instances found."
fi

# Also try to find and kill any Python HTTP servers on our ports
for port in 8080 8081 8082; do
    pid=$(lsof -t -i:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        echo "   Stopped process on port $port"
    fi
done

echo ""
echo "All dashboards have been stopped."
