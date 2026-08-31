#!/bin/bash

# ==============================================================================
# COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL - HMS ONE-CLICK LAUNCH SCRIPT
# Project Path: /home/dell/prakhar_ayurveda_hms
# ==============================================================================

PROJECT_DIR="/home/dell/prakhar_ayurveda_hms"
cd "$PROJECT_DIR" || exit 1

echo "======================================================================"
echo "🏥 COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL — HMS"
echo "📂 Project Path: $PROJECT_DIR"
echo "======================================================================"

# Function to clean up background processes on Ctrl+C / Exit
cleanup() {
    echo ""
    echo "🛑 Shutting down COER HMS system processes..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Secure Express Authentication & User Server (Port 5000)
echo "🔒 Starting Express Auth & Security Backend Server on port 5000..."
node server/index.js &
SERVER_PID=$!
sleep 2

# 2. Start Vite Web App Server (Port 5173)
echo "🌐 Launching COER HMS Web Application on http://localhost:5173/..."
npm run dev -- --host 0.0.0.0 --port 5173

wait
