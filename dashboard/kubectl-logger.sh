#!/bin/bash

# Real Kubernetes Operations Logger
# This script wraps kubectl commands and logs them to a file that the dashboard can read

LOG_FILE="/tmp/k8s-operations.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log operation
log_operation() {
    local operation=$1
    local resource=$2
    local name=$3
    local namespace=${4:-"default"}
    local details=$5
    
    echo "{\"timestamp\":\"$TIMESTAMP\",\"operation\":\"$operation\",\"resource\":\"$resource\",\"name\":\"$name\",\"namespace\":\"$namespace\",\"details\":\"$details\"}" >> "$LOG_FILE"
}

# Parse kubectl command and log it
KUBECTL_CMD="$@"

# Execute the actual kubectl command
kubectl "$@"
EXIT_CODE=$?

# Log based on command
case "$1" in
    create)
        log_operation "create" "$2" "$3" "$4" "Created via kubectl"
        ;;
    delete)
        log_operation "delete" "$2" "$3" "$4" "Deleted via kubectl"
        ;;
    apply)
        log_operation "apply" "$2" "$3" "$4" "Applied configuration"
        ;;
    scale)
        log_operation "scale" "$2" "$3" "$4" "Scaled deployment"
        ;;
    edit)
        log_operation "edit" "$2" "$3" "$4" "Edited resource"
        ;;
esac

exit $EXIT_CODE
