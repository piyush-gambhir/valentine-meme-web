#!/usr/bin/env bash









set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV="${1:-production}"
DEPLOY_ENV_FILE=".env.deploy.${ENV}"

if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  echo "==> Loading ${DEPLOY_ENV_FILE}"
  set -a
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
  set +a
else
  echo "==> No ${DEPLOY_ENV_FILE} found — falling back to local wrangler OAuth session."
  if ! npx --yes wrangler@latest whoami >/dev/null 2>&1; then
    echo "error: not logged in to wrangler. Run \`wrangler login\` first," >&2
    echo "       or create ${DEPLOY_ENV_FILE} from .env.deploy.example." >&2
    exit 1
  fi
fi

CF_PROJECT_NAME="${CF_PROJECT_NAME:-valentine-meme}"
BUILD_DIR="${BUILD_DIR:-dist}"

if [[ "$ENV" == "production" ]]; then
  CF_BRANCH="${CF_PRODUCTION_BRANCH:-main}"
else
  CF_BRANCH="${CF_PREVIEW_BRANCH:-preview}"
fi

echo "==> Building site"
pnpm install --frozen-lockfile
pnpm build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "error: build directory ${BUILD_DIR} not found after build" >&2
  exit 1
fi

echo "==> Deploying ${BUILD_DIR}/ to Cloudflare Pages project '${CF_PROJECT_NAME}' (branch: ${CF_BRANCH})"



if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  export CLOUDFLARE_API_TOKEN
fi
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  export CLOUDFLARE_ACCOUNT_ID
fi

npx --yes wrangler@latest pages deploy "$BUILD_DIR" \
  --project-name="$CF_PROJECT_NAME" \
  --branch="$CF_BRANCH"
