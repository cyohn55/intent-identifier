#!/bin/bash

###############################################################################
# Intent Identifier Server Startup Script
#
# This script starts the Intent Identifier server with proper configuration
# and error handling.
#
# Usage:
#   ./start-server.sh           # Start normally
#   ./start-server.sh --pm2     # Start with PM2
#   ./start-server.sh --dev     # Start in development mode
###############################################################################

# Configuration
PORT=8888
NODE_ENV="production"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/Frontend/server.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

check_dependencies() {
    print_info "Checking dependencies..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check if node_modules exists
    if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
        print_info "node_modules not found. Installing dependencies..."
        cd "$SCRIPT_DIR" && npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies"
            exit 1
        fi
        print_success "Dependencies installed"
    else
        print_success "Dependencies found"
    fi
}

check_port() {
    print_info "Checking if port $PORT is available..."

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_error "Port $PORT is already in use"
        print_info "Process using port $PORT:"
        lsof -Pi :$PORT -sTCP:LISTEN
        read -p "Kill the process and continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$PORT | xargs kill -9
            print_success "Process killed"
        else
            exit 1
        fi
    else
        print_success "Port $PORT is available"
    fi
}

check_ollama() {
    print_info "Checking Ollama connection..."

    if curl -s http://localhost:11434 > /dev/null 2>&1; then
        print_success "Ollama is running"
    else
        print_error "Ollama is not running at http://localhost:11434"
        print_info "Please start Ollama: ollama serve"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

create_logs_dir() {
    if [ ! -d "$SCRIPT_DIR/logs" ]; then
        mkdir -p "$SCRIPT_DIR/logs"
        print_success "Created logs directory"
    fi
}

start_normal() {
    print_info "Starting server on port $PORT..."
    cd "$SCRIPT_DIR"
    PORT=$PORT NODE_ENV=$NODE_ENV node "$SERVER_SCRIPT"
}

start_pm2() {
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed"
        print_info "Install PM2: npm install -g pm2"
        exit 1
    fi

    print_info "Starting server with PM2..."
    cd "$SCRIPT_DIR"

    # Stop existing instance if running
    pm2 delete intent-identifier 2>/dev/null

    # Start with PM2
    if [ -f "$SCRIPT_DIR/ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        PORT=$PORT pm2 start "$SERVER_SCRIPT" --name "intent-identifier"
    fi

    # Save PM2 process list
    pm2 save

    print_success "Server started with PM2"
    print_info "View logs: pm2 logs intent-identifier"
    print_info "Monitor: pm2 monit"
    print_info "Stop: pm2 stop intent-identifier"
}

start_dev() {
    print_info "Starting server in development mode..."
    NODE_ENV="development"
    cd "$SCRIPT_DIR"
    PORT=$PORT NODE_ENV=$NODE_ENV nodemon "$SERVER_SCRIPT" 2>/dev/null || node "$SERVER_SCRIPT"
}

# Main script
echo "========================================"
echo "  Intent Identifier Server Startup"
echo "========================================"
echo

# Run checks
check_dependencies
check_port
check_ollama
create_logs_dir

echo
echo "========================================"
echo

# Parse arguments
case "$1" in
    --pm2)
        start_pm2
        ;;
    --dev)
        start_dev
        ;;
    *)
        start_normal
        ;;
esac
