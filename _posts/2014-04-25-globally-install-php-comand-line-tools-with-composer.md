---
title: "Globally install PHP command-line tools with Composer"
summary: "How to install CLI tools wiht Composer."
tags: ["php"]
---

We are spoiled with all the great PHP command-line tools available these days.
[PHPUnit] and [Codeception] for testing and [Phinx] for migrations, just to
name a few. With [Composer] its easy to add to your project, but then you end
up having to issue commands like `php /path/to/my/project/vendor/bin/phpunit`
when you would prefer to issue `phpunit`. Also, it's annoying to have to
manually add PHPUnit to every project you work on. Here is a better solution:

1. Create a dummy Composer project within your home directory
2. Add its `vendor/bin` directory to your path

## How-To

In your home directory create a directory called `composer-packages`
which contains the following `composer.json` file:

```json
{
  "require": {
    "phpunit/phpunit": "3.7.*",
    "codeception/codeception": "*",
    "robmorgan/phinx": "*"
  }
}
```

In that directory run `composer install`

Then, add the following line to your `.bashrc`:

```bash
export PATH=~/composer-packages/vendor/bin:$PATH
```

After restarting your terminal, you can issue `codecept`, `phpunit` or `phinx`
from any directory on your computer. Cool!

## Bonus

In my setup, for bonus points, all this stuff lives in my [dotfiles] on GitHub.
Since every machine I work on has a clone of my dotfiles, with just one
`composer update` I can have all my PHP tools globally installed on any
machine.

[phpunit]: http://phpunit.de/
[codeception]: http://codeception.com/
[phinx]: http://phinx.org/
[composer]: https://getcomposer.org/
[dotfiles]: https://github.com/captbaritone/dotfiles/tree/master/composer-packages
