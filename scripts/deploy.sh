# Exit if any command fails
set -e

if ! git diff-index --quiet HEAD --; then
  echo "Git is dirty. Commit your changes before deploying."
  exit 1
fi

# The server deploys origin/master, whatever branch this is run from.
if [ "$(git rev-parse --abbrev-ref HEAD)" != "master" ]; then
  echo "Not on master. The server deploys origin/master; merge first."
  exit 1
fi

echo "Pushing to origin"
git push origin

echo "Building and restarting on server..."
ssh jordan 'bash -s' <<'REMOTE'
set -e
cd ~/projects/jordaneldredge.com

echo "Pulling latest code"
git fetch origin
git rebase origin/master

# Source nvm and use the Node version in .nvmrc. The pnpm version comes from
# package.json's packageManager, which pnpm switches to on its own.
. ~/.nvm/nvm.sh
nvm use

echo "Installing dependencies"
# Frozen, so a pnpm that disagrees with the lockfile fails here instead of
# rewriting it and leaving the next deploy's rebase blocked. When a pnpm
# upgrade needs node_modules rebuilt it asks first, and there is nobody here
# to answer.
pnpm install --frozen-lockfile --config.confirmModulesPurge=false

echo "Running migrations"
pnpm run migrate

echo "Building search-query-dsl"
cd packages/search-query-dsl
pnpm build
cd ../..

echo "Building jordaneldredge.com"
rm -rf build
pnpm build

echo "Restarting service"
sudo systemctl restart jordaneldredge.service

echo "Deploy complete!"
REMOTE
