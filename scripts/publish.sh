#!/usr/bin/env bash
set -euo pipefail
# Run only after build and tests. The deploy branch contains generated runtime files.
ARENA_RELEASE_DIR="$(mktemp -d)"
trap 'rm -rf "$ARENA_RELEASE_DIR"' EXIT
mkdir -p "$ARENA_RELEASE_DIR/api" "$ARENA_RELEASE_DIR/data" "$ARENA_RELEASE_DIR/assets-build"
cp .htaccess app.html "$ARENA_RELEASE_DIR/"
cp api/.htaccess api/core.php api/index.php api/setup.php "$ARENA_RELEASE_DIR/api/"
cp data/questions.json "$ARENA_RELEASE_DIR/data/"
cp -R assets-build/assets "$ARENA_RELEASE_DIR/assets-build/"
printf '%s\n' "${SOURCE_SHA:-$(git rev-parse HEAD)}" > "$ARENA_RELEASE_DIR/version.txt"
# Reuse checkout credentials without placing tokens in a remote URL or log.
ARENA_AUTH_HEADER="$(git config --local --get http.https://github.com/.extraheader || true)"
ARENA_REMOTE_URL="$(git remote get-url origin)"
git -C "$ARENA_RELEASE_DIR" init -b codex/deploy
git -C "$ARENA_RELEASE_DIR" config user.name 'github-actions[bot]'
git -C "$ARENA_RELEASE_DIR" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$ARENA_RELEASE_DIR" remote add origin "$ARENA_REMOTE_URL"
if [ -n "$ARENA_AUTH_HEADER" ]; then
  git -C "$ARENA_RELEASE_DIR" config http.https://github.com/.extraheader "$ARENA_AUTH_HEADER"
fi
# Preserve deployment history and use a normal fast-forward push.
if git -C "$ARENA_RELEASE_DIR" fetch origin codex/deploy --depth=1; then
  git -C "$ARENA_RELEASE_DIR" reset --soft FETCH_HEAD
fi
git -C "$ARENA_RELEASE_DIR" add -A
git -C "$ARENA_RELEASE_DIR" commit -m "Deploy ${SOURCE_SHA:-$(git rev-parse HEAD)}"
git -C "$ARENA_RELEASE_DIR" push origin HEAD:refs/heads/codex/deploy
