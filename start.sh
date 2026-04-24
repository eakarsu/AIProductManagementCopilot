#!/bin/bash

# =============================================================================
# AI Product Management Copilot - Start Script
# =============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           AI Product Management Copilot                     ║"
echo "║           Powered by OpenRouter AI                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Loaded .env configuration${NC}"
else
  echo -e "${RED}✗ .env file not found! Creating default...${NC}"
  cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pm_copilot
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-haiku-4.5
JWT_SECRET=pm-copilot-secret-key-2024
BACKEND_PORT=4000
FRONTEND_PORT=3000
EOF
  export $(grep -v '^#' .env | xargs)
  echo -e "${YELLOW}⚠ Default .env created. Please update OPENROUTER_API_KEY${NC}"
fi

BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# =============================================================================
# Clean up used ports
# =============================================================================
echo -e "\n${CYAN}▸ Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${YELLOW}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# =============================================================================
# Check PostgreSQL
# =============================================================================
echo -e "\n${CYAN}▸ Checking PostgreSQL...${NC}"

if ! command -v psql &>/dev/null; then
  echo -e "${RED}✗ PostgreSQL not found. Please install PostgreSQL.${NC}"
  exit 1
fi

# Try to start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${YELLOW}PostgreSQL not running. Attempting to start...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 2
fi

if pg_isready -q 2>/dev/null; then
  echo -e "  ${GREEN}✓ PostgreSQL is running${NC}"
else
  echo -e "  ${RED}✗ PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# =============================================================================
# Create Database & Schema
# =============================================================================
echo -e "\n${CYAN}▸ Setting up database...${NC}"

# Create database if it doesn't exist
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'pm_copilot'" 2>/dev/null | grep -q 1 || {
  psql -U postgres -c "CREATE DATABASE pm_copilot" 2>/dev/null
  echo -e "  ${GREEN}✓ Database 'pm_copilot' created${NC}"
}

# Run schema
psql -U postgres -d pm_copilot -f "$PROJECT_DIR/server/schema.sql" 2>/dev/null
echo -e "  ${GREEN}✓ Schema applied${NC}"

# =============================================================================
# Install Dependencies
# =============================================================================
echo -e "\n${CYAN}▸ Installing dependencies...${NC}"

# Backend
if [ ! -d "server/node_modules" ]; then
  echo -e "  ${YELLOW}Installing backend dependencies...${NC}"
  cd server && npm install && cd ..
else
  echo -e "  ${GREEN}✓ Backend dependencies present${NC}"
fi

# Frontend
if [ ! -d "node_modules" ]; then
  echo -e "  ${YELLOW}Installing frontend dependencies...${NC}"
  npm install
else
  echo -e "  ${GREEN}✓ Frontend dependencies present${NC}"
fi

# =============================================================================
# Seed Data
# =============================================================================
echo -e "\n${CYAN}▸ Seeding database with sample data...${NC}"
cd "$PROJECT_DIR"
node server/seed.js
echo -e "  ${GREEN}✓ Database seeded successfully${NC}"

# =============================================================================
# Start Services with Hot Reload
# =============================================================================
echo -e "\n${CYAN}▸ Starting services with hot reload...${NC}"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  kill $(jobs -p) 2>/dev/null || true
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend with nodemon for hot reload (or node --watch)
echo -e "  ${BLUE}Starting backend on port ${BACKEND_PORT}...${NC}"
if command -v npx &>/dev/null; then
  cd "$PROJECT_DIR"
  npx -y nodemon --watch server server/index.js &
else
  node --watch server/index.js &
fi
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2
echo -e "  ${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"

# Start frontend with hot reload (react-scripts start has it built-in)
echo -e "  ${BLUE}Starting frontend on port ${FRONTEND_PORT}...${NC}"
cd "$PROJECT_DIR"
PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ AI Product Management Copilot is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:${FRONTEND_PORT}"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:${BACKEND_PORT}"
echo -e "  ${CYAN}API Docs:${NC}  http://localhost:${BACKEND_PORT}/api/health"
echo -e ""
echo -e "  ${PURPLE}Demo Login:${NC}"
echo -e "    Email:    demo@pmcopilot.com"
echo -e "    Password: password123"
echo -e ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e ""

# Wait for background processes
wait
