#!/usr/bin/env bash
set -euo pipefail

EXTRA=()

if [[ -n "${CYPRESS_RECORD_KEY:-}" ]]; then
  BUILD_ID="${CYPRESS_CI_BUILD_ID:-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-$(date +%s)}}"
  EXTRA+=(--record --ci-build-id "$BUILD_ID")

  if [[ -n "${CYPRESS_CLOUD_GROUP:-}" ]]; then
    EXTRA+=(--group "$CYPRESS_CLOUD_GROUP")
  fi

  if [[ "${CYPRESS_PARALLEL:-}" == "true" ]]; then
    EXTRA+=(--parallel)
  fi
fi

exec npx cypress run "${EXTRA[@]}" "$@"
