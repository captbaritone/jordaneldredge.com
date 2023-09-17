yarn build
scp -r build/* jordan:~/projects/jordaneldredge.com/build
# On server
# cd ~/projects/jordaneldredge.com
# git fetch origin
# git rebase origin/master
# yarn
# pm2 restart jordaneldredge.com