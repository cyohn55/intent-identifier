#!/bin/bash
# Comprehensive Test Script for Intent Identifier
# Tests both backend and frontend functionality

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Intent Identifier - Comprehensive Test Suite"
echo "════════════════════════════════════════════════════════════"
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# ============================================
# 1. PREREQUISITES CHECK
# ============================================
echo -e "${BLUE}[1/5] Checking Prerequisites...${NC}"
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_result 0 "Python installed: $PYTHON_VERSION"
else
    print_result 1 "Python 3 not found"
    exit 1
fi

# Check pip
if command -v pip3 &> /dev/null; then
    print_result 0 "pip installed"
else
    print_result 1 "pip not found"
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    print_result 0 "Ollama installed"

    # Check if Ollama is running
    if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
        print_result 0 "Ollama is running"
    else
        print_result 1 "Ollama is not running (run: ollama serve)"
    fi

    # Check for llama3.2 model
    if ollama list | grep -q "llama3.2"; then
        print_result 0 "llama3.2 model available"
    else
        print_result 1 "llama3.2 model not found (run: ollama pull llama3.2)"
    fi
else
    print_result 1 "Ollama not installed"
fi

echo ""

# ============================================
# 2. BACKEND UNIT TESTS
# ============================================
echo -e "${BLUE}[2/5] Running Backend Unit Tests...${NC}"
echo ""

cd backend

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}Installing pytest...${NC}"
    pip3 install pytest pytest-asyncio httpx > /dev/null 2>&1
fi

# Run pytest
if pytest "../tests" -v --tb=short > /tmp/pytest_output.txt 2>&1; then
    print_result 0 "All unit tests passed"
    # Count tests
    TEST_COUNT=$(grep -c "PASSED" /tmp/pytest_output.txt || echo "0")
    echo -e "  ${GREEN}→ $TEST_COUNT tests passed${NC}"
else
    print_result 1 "Some unit tests failed"
    echo -e "${YELLOW}See /tmp/pytest_output.txt for details${NC}"
fi

cd ..

echo ""

# ============================================
# 3. BACKEND SERVER TEST
# ============================================
echo -e "${BLUE}[3/5] Testing Backend Server...${NC}"
echo ""

# Start server in background
echo "Starting backend server..."
cd backend
python3 server.py > /tmp/server_output.txt 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 5

# Test health endpoint
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_result 0 "Server started successfully"

    # Test health endpoint response
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
    if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
        print_result 0 "Health endpoint returns OK"
    else
        print_result 1 "Health endpoint returned unexpected response"
    fi

    # Test categories endpoint
    if curl -s http://localhost:3000/api/categories | grep -q "greeting"; then
        print_result 0 "Categories endpoint working"
    else
        print_result 1 "Categories endpoint failed"
    fi

    # Test classify endpoint
    CLASSIFY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/classify \
        -H "Content-Type: application/json" \
        -d '{"message": "Hello"}')

    if echo "$CLASSIFY_RESPONSE" | grep -q "intent"; then
        print_result 0 "Classify endpoint working"

        # Check if intent is greeting
        if echo "$CLASSIFY_RESPONSE" | grep -q "greeting"; then
            print_result 0 "Intent classification correct (greeting)"
        else
            print_result 1 "Intent classification incorrect"
        fi
    else
        print_result 1 "Classify endpoint failed"
    fi

else
    print_result 1 "Server failed to start"
    echo -e "${YELLOW}Check /tmp/server_output.txt for errors${NC}"
fi

echo ""

# ============================================
# 4. FRONTEND FILES CHECK
# ============================================
echo -e "${BLUE}[4/5] Checking Frontend Files...${NC}"
echo ""

# Check frontend JavaScript files exist
if [ -f "frontend/app.js" ]; then
    print_result 0 "app.js exists"
else
    print_result 1 "app.js not found"
fi

if [ -f "frontend/config.js" ]; then
    print_result 0 "config.js exists"
else
    print_result 1 "config.js not found"
fi

if [ -f "frontend/soul-buddy-animator.js" ]; then
    print_result 0 "soul-buddy-animator.js exists"
else
    print_result 1 "soul-buddy-animator.js not found"
fi

if [ -f "frontend/index.html" ]; then
    print_result 0 "index.html exists"
else
    print_result 1 "index.html not found"
fi

# Check Models directory
if [ -d "Models" ]; then
    print_result 0 "Models directory exists"
    MODEL_COUNT=$(find Models -name "*.glb" 2>/dev/null | wc -l)
    echo -e "  ${GREEN}→ Found $MODEL_COUNT 3D model files${NC}"
else
    print_result 1 "Models directory not found"
fi

echo ""

# ============================================
# 5. INTEGRATION TEST
# ============================================
echo -e "${BLUE}[5/5] Integration Test...${NC}"
echo ""

# Test that frontend can be accessed
if curl -s http://localhost:3000/ | grep -q "Intent Identifier"; then
    print_result 0 "Frontend accessible at http://localhost:3000/"
else
    print_result 1 "Frontend not accessible"
fi

# Test API documentation
if curl -s http://localhost:3000/docs | grep -q "swagger"; then
    print_result 0 "API documentation accessible at /docs"
else
    print_result 1 "API documentation not accessible"
fi

echo ""

# ============================================
# CLEANUP
# ============================================
echo -e "${YELLOW}Stopping test server...${NC}"
kill $SERVER_PID 2>/dev/null || true
sleep 2

# ============================================
# SUMMARY
# ============================================
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Test Summary"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ ALL TESTS PASSED! System is ready to use.${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start the server:  cd backend && python3 server.py"
    echo "  2. Open browser:      http://localhost:3000/"
    echo "  3. Test the chat interface and 3D animations"
    echo ""
    exit 0
else
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ✗ SOME TESTS FAILED. Please review errors above.${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check logs: /tmp/server_output.txt"
    echo "  - Check test output: /tmp/pytest_output.txt"
    echo "  - Ensure Ollama is running: ollama serve"
    echo "  - Ensure llama3.2 model: ollama pull llama3.2"
    echo "  - Review: TESTING_GUIDE.md"
    echo ""
    exit 1
fi
