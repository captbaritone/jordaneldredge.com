all: deploy

deploy:
	ssh jordaneldredge.com bash -l < deploy.sh

serve:
	bundle exec jekyll serve --drafts
