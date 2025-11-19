#!/bin/bash
# Test Runner Script for Python Backend

echo "========================================="
echo "  Intent Identifier - Python Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest is not installed${NC}"
    echo "Install with: pip install pytest pytest-asyncio"
    exit 1
fi

# Check if Working directory modules exist
if [ ! -f "agent_config.py" ]; then
    echo -e "${YELLOW}Warning: agent_config.py not found in current directory${NC}"
    echo "Make sure you're running this script from the Working directory"
fi

# Add current directory to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

echo -e "${GREEN}Running all tests...${NC}"
echo ""

# Run pytest with verbose output
pytest "../Unit Tests" -v --tb=short

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed${NC}"
fi

echo "========================================="

exit $TEST_EXIT_CODE
