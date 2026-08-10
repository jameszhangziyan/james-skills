#!/usr/bin/env bash
# One-shot push to GitHub Pages.
# Usage:
#   ./scripts/push.sh                       # default: jameszhangziyan/james-skills, public
#   REPO=jameszhangziyan/james-skills VISIBILITY=public ./scripts/push.sh
#   REPO=jameszhangziyan/james-skills VISIBILITY=private ./scripts/push.sh
#
# After push, go to https://github.com/<REPO>/settings/pages and set
# "Source" to "GitHub Actions" (one-time setup).

set -euo pipefail

REPO="${REPO:-jameszhangziyan/james-skills}"
VISIBILITY="${VISIBILITY:-public}"
BRANCH="${BRANCH:-main}"

# Resolve the site root (parent of this script's dir).
SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SITE_ROOT"

# ---------- Sanity checks ----------
for f in index.html public/favicon.svg .github/workflows/deploy-pages.yml README.md; do
  if [[ ! -e "$f" ]]; then
    echo "✗ Missing $f — run from the website/ directory" >&2
    exit 1
  fi
done

# ---------- Auth check ----------
if command -v gh >/dev/null 2>&1; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "✗ gh CLI not authenticated. Run: gh auth login" >&2
    exit 1
  fi
  GH_OK=1
else
  echo "→ gh CLI not found, falling back to git credentials" >&2
  GH_OK=0
fi

# ---------- Step 1: Initialize git FIRST (must happen before gh) ----------
if [[ ! -d .git ]]; then
  echo "→ Initializing git repo on branch '$BRANCH'…"
  git init -b "$BRANCH" >/dev/null
fi

# Ensure user is configured (otherwise commit will fail)
if ! git config user.name >/dev/null 2>&1; then
  echo "→ Setting local git user.name / user.email…"
  git config user.name "James Zhang"
  git config user.email "james.zhangziyan@gmail.com"
fi

# ---------- Step 2: Create GitHub repo (only with gh) ----------
if [[ "$GH_OK" -eq 1 ]]; then
  if gh repo view "$REPO" >/dev/null 2>&1; then
    echo "→ Repo $REPO already exists, reusing."
  else
    echo "→ Creating repo $REPO ($VISIBILITY)…"
    gh repo create "$REPO" \
      --"$VISIBILITY" \
      --description "James Skills — a growing constellation of Codex skills" \
      --add-readme=false
  fi
fi

# ---------- Step 3: Configure origin remote ----------
ORIGIN_URL="https://github.com/${REPO}.git"
if git remote get-url origin >/dev/null 2>&1; then
  current="$(git remote get-url origin)"
  if [[ "$current" != "$ORIGIN_URL" ]]; then
    echo "→ Updating origin: $current → $ORIGIN_URL"
    git remote set-url origin "$ORIGIN_URL"
  else
    echo "→ Origin already set to $ORIGIN_URL"
  fi
else
  echo "→ Adding origin → $ORIGIN_URL"
  git remote add origin "$ORIGIN_URL"
fi

# ---------- Step 4: Switch to the right branch ----------
CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo "")"
if [[ -z "$CURRENT_BRANCH" ]]; then
  git checkout -b "$BRANCH" >/dev/null
elif [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  git checkout -B "$BRANCH" >/dev/null
fi

# ---------- Step 5: Stage, commit, push ----------
echo "→ Staging files…"
git add -A

if git diff --cached --quiet; then
  echo "→ No changes to commit."
else
  echo "→ Committing…"
  git commit -m "Deploy: James Skills (Dala dark-void, 20 skills)" >/dev/null
fi

echo "→ Pushing to origin/$BRANCH…"
git push -u origin "$BRANCH" --force-with-lease

cat << 'NEXT'

✓ Pushed. Now one-time setup on GitHub:

  1. Open https://github.com/REPO/settings/pages
  2. Under "Build and deployment → Source", choose "GitHub Actions".
  3. Wait ~30 s for the workflow to finish.
  4. Your site will be live at:
       https://jameszhangziyan.github.io/james-skills/
NEXT
