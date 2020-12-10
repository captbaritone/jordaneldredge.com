#!/usr/bin/env bash

# Bail on errors
set -e

cd /var/www/jordaneldredge.com/

echo "Pulling down new version"
git pull

echo "Install ruby dependencies"
bundle install

echo "Building Jekyll"
bundle exec jekyll build

echo "Done!"
echo "Check out https://jordaneldredge.com"
