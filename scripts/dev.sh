#!/usr/bin/env bash
# Start all services for local development
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== OSC Digital Tool — Local Development ==="
echo ""

# Start PostgreSQL (via Docker)
echo "[1/3] Starting PostgreSQL..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres
echo "  PostgreSQL running on localhost:5432"
echo ""

# Start Backend
echo "[2/3] Starting ASP.NET backend..."
(cd "$ROOT_DIR/backend/src/OscApi" && dotnet run --urls "http://localhost:5082") &
BACKEND_PID=$!
echo "  Backend starting on http://localhost:5082"
echo ""

# Start Frontend
echo "[3/3] Starting Next.js frontend..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!
echo "  Frontend starting on http://localhost:3000"
echo ""

echo "=== All services started ==="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5082"
echo "  Swagger:   http://localhost:5082/swagger"
echo "  Postgres:  localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services."

# Cleanup on exit
cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  docker compose -f "$ROOT_DIR/docker-compose.yml" stop postgres
}
trap cleanup EXIT

wait
