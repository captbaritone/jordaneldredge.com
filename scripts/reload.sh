# Exit if any command fails
set -e


# Source nvm
# https://unix.stackexchange.com/a/184512
. ~/.nvm/nvm.sh

echo "Fetching and rebasing"
git fetch origin
git rebase origin/master
echo "Updating node_modules"
nvm use 20
pnpm i
echo "Reloading pm2"
pm2 reload ecosystem.config.js
