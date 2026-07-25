#!/bin/bash
cd "$(dirname "$0")"

echo "=== Neon Realm — 启动中 ==="
echo ""

# Kill any existing dev server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start Next.js dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "等待服务器启动..."
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Open browser
open http://localhost:3000

echo ""
echo "网站已打开: http://localhost:3000"
echo "关闭此窗口将停止服务器"
echo ""

# Wait for user to close this window, then kill the dev server
trap "kill $DEV_PID 2>/dev/null; exit" INT TERM EXIT
wait $DEV_PID
