#!/bin/bash
set -e

cd /home/fonyuy-verena/code/github.com/verna990/C5/EventHub-C5/frontend

# Clean up any leftover processes
pkill -f "next.*3099" 2>/dev/null || true
sleep 1

# Start frontend on port 3099
./node_modules/.bin/next dev -p 3099 &
FPID=$!

# Wait for frontend to be ready (up to 60s)
for i in $(seq 1 60); do
  if curl -sf http://localhost:3099 > /dev/null 2>&1; then
    echo "READY after ${i}s"
    break
  fi
  sleep 1
done

# Run tests
node frontend-test.cjs
TEST_EXIT=$?

# Cleanup
kill $FPID 2>/dev/null || true
exit $TEST_EXIT
