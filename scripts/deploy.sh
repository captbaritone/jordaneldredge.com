# Prompt if git is dirty
if ! git diff-index --quiet HEAD --; then
  echo "Git is dirty. Commit your changes before deploying."
  exit 1
fi
echo "Pushing to origin"
git push origin
echo "Building"

echo "Cleaning up old build"
rm -rf build

# https://stackoverflow.com/a/45384470
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm use 20
pnpm build
echo "Copying to server"
scp -r build/* jordan:~/projects/jordaneldredge.com/build

echo "Build complete and copied to server"
echo "On server"
echo "cd ~/projects/jordaneldredge.com"
echo "git fetch origin"
echo "git rebase origin/master"
echo "pnpm i"
echo "pm2 restart jordaneldredge.com"