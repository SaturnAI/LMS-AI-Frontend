#!/bin/bash
set -e  # Stop the script immediately on any error

PORT=5016
PROJECT_DIR="/root/LMS-AI-Frontend"
APP_NAME="LMS-AI-Frontend"

echo "🚀 Starting deployment process for Vibhu-Portfolio..."
cd "$PROJECT_DIR" || { echo "❌ Failed to enter project directory"; exit 1; }

echo "🔍 Checking for existing process on port $PORT..."
PID=$(sudo netstat -tulpn 2>/dev/null | grep ":$PORT" | awk '{print $7}' | cut -d'/' -f1)

if [ -n "$PID" ]; then
  echo "🧨 Killing process using port $PORT (PID: $PID)"
  sudo kill -9 "$PID" || echo "⚠️ Failed to kill process $PID, it may have already exited."
else
  echo "✅ No process found on port $PORT"
fi

echo "📡 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
npm install --silent

echo "🔨 Building the app..."
npm run build

echo "🚀 Starting the app on port $PORT with PM2..."
# Check if PM2 is installed, if not install it
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2 globally..."
  sudo npm install -g pm2
fi

# Stop the old PM2 process if it exists
if pm2 list | grep -q "$APP_NAME"; then
  echo "🔁 Stopping existing PM2 process..."
  pm2 stop "$APP_NAME"
  pm2 delete "$APP_NAME"
fi

# Start the app with PM2
pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
pm2 save

echo "✅ App started in background via PM2."
pm2 status
