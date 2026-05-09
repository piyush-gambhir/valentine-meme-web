#!/usr/bin/env bash
# Local Cloudflare Pages deploy. Run as `bash scripts/deploy.sh [production|development]`.
#
# Reads credentials from .env.deploy.<env> (gitignored).
# See .env.deploy.example for the full list.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV="${1:-production}"
DEPLOY_ENV_FILE=".env.deploy.${ENV}"

if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "error: ${DEPLOY_ENV_FILE} not found in $(pwd)" >&2
  echo "       copy .env.deploy.example to ${DEPLOY_ENV_FILE} and fill in your values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV_FILE"
set +a

: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID in ${DEPLOY_ENV_FILE}}"
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN in ${DEPLOY_ENV_FILE}}"
: "${CF_PROJECT_NAME:?set CF_PROJECT_NAME in ${DEPLOY_ENV_FILE}}"

BUILD_DIR="${BUILD_DIR:-dist}"

echo "==> Building site"
pnpm install --frozen-lockfile
pnpm build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "error: build directory ${BUILD_DIR} not found after build" >&2
  exit 1
fi

# Cloudflare Pages "branch" determines preview vs prod alias. Anything other
# than the project's production branch is treated as a preview.
if [[ "$ENV" == "production" ]]; then
  CF_BRANCH="${CF_PRODUCTION_BRANCH:-main}"
else
  CF_BRANCH="${CF_PREVIEW_BRANCH:-preview}"
fi

echo "==> Deploying ${BUILD_DIR}/ to Cloudflare Pages project '${CF_PROJECT_NAME}' (branch: ${CF_BRANCH})"
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN
npx --yes wrangler@latest pages deploy "$BUILD_DIR" \
  --project-name="$CF_PROJECT_NAME" \
  --branch="$CF_BRANCH"
