@echo off
TITLE COER Medical College of Ayurveda & Hospital — HMS Windows Server Launcher
COLOR 0A
CLS
ECHO ======================================================================
ECHO 🏥 COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL — HMS
ECHO 📂 Windows Server Production Launcher
ECHO ======================================================================
ECHO.
ECHO 🔒 Starting Express Authentication & Real-Time Database Server (Port 5000)...
start "COER HMS Backend Server (Port 5000)" cmd /k "node server/index.js"

ECHO 🌐 Launching COER HMS PWA Web Application (Port 5173 on 0.0.0.0)...
start "COER HMS Web App (Port 5173)" cmd /k "npx vite --host 0.0.0.0 --port 5173"

ECHO.
ECHO ✅ Both Backend and Web Application started successfully!
ECHO.
ECHO 🌐 Local Server Access:   http://localhost:5173/
ECHO 🌐 Network LAN / WAN:     http://YOUR_WINDOWS_SERVER_IP:5173/
ECHO 🔒 API Backend Server:    http://localhost:5000/
ECHO.
ECHO ======================================================================
ECHO Note: Leave the two backend CMD windows running in background.
ECHO ======================================================================
PAUSE
