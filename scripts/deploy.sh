# Prompt if git is dirty

# Exit if any command fails
set -e

if ! git diff-index --quiet HEAD --; then
  echo "Git is dirty. Commit your changes before deploying."
  exit 1
fi
echo "Pushing to origin"
git push origin
echo building search-query-dsl
cd packages/search-query-dsl
pnpm build
cd ../..
echo "Building jordaneldredge.com"

echo "Cleaning up old build"
rm -rf build

# https://stackoverflow.com/a/45384470
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm use 20
pnpm build
echo "Copying to server"
rsync -az --progress -e ssh build/ jordan:~/projects/jordaneldredge.com/build/

echo "Build complete and copied to server"
echo "On server:\n\n"
echo "cd ~/projects/jordaneldredge.com"
echo "./scripts/reload.sh\n\n"
echo "Celebrate! 🎉"