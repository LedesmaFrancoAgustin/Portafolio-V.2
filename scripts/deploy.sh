#!/usr/bin/env bash
# Builds the site and publishes dist/ to the "deploy" branch,
# so Hostinger's git-sync can redeploy it as static files.
set -euo pipefail

BRANCH="deploy"
WORKTREE_DIR=".deploy-worktree"

cd "$(dirname "$0")/.."

echo "==> Building..."
npm run build

git fetch origin "$BRANCH" >/dev/null 2>&1 || true
rm -rf "$WORKTREE_DIR"

if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "==> Checking out existing '$BRANCH' branch..."
  git worktree add "$WORKTREE_DIR" "$BRANCH" >/dev/null
else
  echo "==> Creating new orphan '$BRANCH' branch..."
  git worktree add --detach "$WORKTREE_DIR" >/dev/null
  (cd "$WORKTREE_DIR" && git checkout --orphan "$BRANCH" && git rm -rf . >/dev/null 2>&1 || true)
fi

find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +
cp -r dist/. "$WORKTREE_DIR"/

cd "$WORKTREE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "==> Nothing changed, dist/ is already up to date."
else
  git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin "$BRANCH"
  echo "==> Pushed to '$BRANCH'."
fi

cd ..
git worktree remove "$WORKTREE_DIR" --force
echo "==> Done. Trigger 'Redeploy' in Hostinger to publish."
