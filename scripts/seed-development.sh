#!/usr/bin/env bash
set -Eeuo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."&&pwd)";if [[ "${NODE_ENV:-development}" == "production" ]];then echo "Development seed is disabled in production." >&2;exit 1;fi;if [[ "${SEED_ACK:-}" != "seed-local-pm-demo" ]];then echo "Set SEED_ACK=seed-local-pm-demo for an isolated development database." >&2;exit 1;fi;(cd "$PROJECT_DIR/server"&&node seed.js)
