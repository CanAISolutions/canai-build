#!/bin/bash

# CanAI Local Build Testing Script
# This script mirrors the Render deployment process for local testing

set -e  # Exit on any error

echo "🚀 Starting CanAI Local Build Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from env.example..."
    cp env.example .env
    print_warning "Please edit .env with your actual values before continuing."
    print_warning "Press Enter when ready to continue..."
    read
fi

# Step 1: Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
REQUIRED_VERSION="18.19.0"
print_success "Node.js version: $NODE_VERSION"

# Step 2: Install dependencies (mirrors Render buildCommand)
print_status "Installing dependencies..."
cd backend
npm ci
print_success "Dependencies installed successfully"

# Step 3: Build the project (mirrors Render buildCommand)
print_status "Building the project..."
npm run build
print_success "Build completed successfully"

# Step 4: Run tests
print_status "Running tests..."
npm test
print_success "Tests passed successfully"

# Step 5: Check for TypeScript errors
print_status "Running TypeScript type check..."
npm run typecheck
print_success "TypeScript type check passed"

# Step 6: Start the server (mirrors Render startCommand)
print_status "Starting the server..."
print_warning "Server will start on port 10000 (or PORT from .env)"
print_warning "Press Ctrl+C to stop the server"

# Set environment variables for local testing
export NODE_ENV=production
export PORT=${PORT:-10000}

# Start the server in the background
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Step 7: Health check
print_status "Performing health check..."
if curl -f http://localhost:$PORT/healthz > /dev/null 2>&1; then
    print_success "Health check passed! Server is running on http://localhost:$PORT"
else
    print_error "Health check failed! Server may not be running properly."
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Step 8: Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:$PORT/healthz | grep -q "ok"; then
    print_success "Health endpoint working"
else
    print_warning "Health endpoint response unexpected"
fi

# Test CORS headers
if curl -s -I http://localhost:$PORT/healthz | grep -q "Access-Control-Allow-Origin"; then
    print_success "CORS headers present"
else
    print_warning "CORS headers not found"
fi

# Step 9: Display server info
echo ""
echo "🎉 Local build test completed successfully!"
echo "=========================================="
echo "Server is running on: http://localhost:$PORT"
echo "Health check: http://localhost:$PORT/healthz"
echo ""
echo "To stop the server, press Ctrl+C"
echo "To view logs, check the terminal output above"

# Keep the script running and handle cleanup
trap 'echo ""; print_status "Stopping server..."; kill $SERVER_PID 2>/dev/null || true; print_success "Server stopped"; exit 0' INT TERM

# Wait for the server process
wait $SERVER_PID