# Exit if any command fails
set -e

if ! git diff-index --quiet HEAD --; then
  echo "Git is dirty. Commit your changes before deploying."
  exit 1
fi

echo "Pushing to origin"
git push origin

echo "Building and restarting on server..."
ssh jordan 'bash -s' <<'REMOTE'
set -e
cd ~/projects/jordaneldredge.com

# Source nvm
. ~/.nvm/nvm.sh
nvm use 20

echo "Pulling latest code"
git fetch origin
git rebase origin/master

echo "Installing dependencies"
pnpm i

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
