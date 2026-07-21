#!/usr/bin/env bash
set -Eeuo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."&&pwd)";if [[ "${MIGRATION_ACK:-}" != "apply-governed-product-001" ]];then echo "Review backup/migration, then set MIGRATION_ACK=apply-governed-product-001." >&2;exit 1;fi;if [[ -z "${DATABASE_URL:-}" ]];then echo "DATABASE_URL is required; no database is created." >&2;exit 1;fi;psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$PROJECT_DIR/server/migrations/001_governed_product_management.sql"
