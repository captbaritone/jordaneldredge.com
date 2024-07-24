# Exit if any command fails
set -e

echo "Fetching and rebasing"
git fetch origin
git rebase origin/master
echo "Updating node_modules"
nvm use 20
pnpm i
echo "Reloading pm2"
pm2 reload ecosystem.config.js