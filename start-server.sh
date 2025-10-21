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
#   ./start-server.sh --ngrok   # Start with ngrok tunnel
###############################################################################

# Configuration
PORT=3000
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

start_normal() {
    print_info "Starting server on port $PORT..."
    cd "$SCRIPT_DIR"
    PORT=$PORT NODE_ENV=$NODE_ENV node "$SERVER_SCRIPT"
}

start_ngrok() {
    print_info "Starting server with ngrok tunnel..."

    # Check if ngrok exists
    if [ ! -f "$SCRIPT_DIR/ngrok" ]; then
        print_error "ngrok not found in $SCRIPT_DIR"
        print_info "Please download ngrok from https://ngrok.com/download"
        exit 1
    fi

    # Kill any existing ngrok processes
    pkill ngrok 2>/dev/null
    sleep 2

    # Start ngrok in the background
    print_info "Starting ngrok tunnel on port $PORT..."
    cd "$SCRIPT_DIR"
    ./ngrok http $PORT --log=stdout > ngrok.log 2>&1 &
    NGROK_PID=$!

    # Wait for ngrok to initialize
    sleep 4

    # Get the public URL
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$PUBLIC_URL" ]; then
        print_success "ngrok tunnel active: $PUBLIC_URL"
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  Public URL: $PUBLIC_URL"
        echo "  ngrok Dashboard: http://localhost:4040"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
    else
        print_error "Could not retrieve ngrok URL. Check ngrok.log for details."
    fi

    # Trap to cleanup ngrok when script exits
    trap "echo ''; print_info 'Stopping ngrok...'; kill $NGROK_PID 2>/dev/null; exit" INT TERM EXIT

    # Start the server
    PORT=$PORT NODE_ENV=$NODE_ENV node "$SERVER_SCRIPT"
}

# Main script
echo "========================================"
echo "  Intent Identifier Server Startup"
echo "========================================"
echo

# Parse arguments
case "$1" in
    --ngrok)
        start_ngrok
        ;;
    *)
        start_normal
        ;;
esac
