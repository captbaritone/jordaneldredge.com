---
title: "Writing a custom Codeception module"
tags: ["php"]
---

I enjoy using [Codeception](http://codeception.com/) to write my acceptance
tests. In January I wrote a [helper
file](https://github.com/captbaritone/mailcatcher-codeception-helper) to help
people test emails sent by the server during acceptance tests. However, it
turns out there is a far better way to package and distribute custom
Codeception actions: as a Module.

While I appreciate Codeception's documentation, it wasn't really clear how to
build your own module for distribution, so I thought I would give some
instructions here.

It can be as simple as creating a Composer package that includes a single class
file. Let's assume we want to create a Hello World module called 'Hello' that
adds an `$I->greet($name)` method.

Let's start with an empty directory for our package.

## The Module

Within your new package's directory create a file: `src/Hello.php` with
the following content:

```php
<?php

namespace Codeception\Module;

use Codeception\Module;

class Hello extends Module
{

    public function greet($name)
    {
        $this->debug("Hello {$name}!");
    }

}
```

## The composer.json

In your package directory, create the following `compsoser.json` file:

```json
{
  "name": "namespace/hello",
  "description": "Hello World Module",
  "authors": [
    {
      "name": "John Doe",
      "email": "johndoe@example.com"
    }
  ],
  "require": {},
  "autoload": {
    "psr-4": {
      "Codeception\\Module\\": "src"
    }
  }
}
```

## Installation

Once you have uploaded your package to GitHub and registered it with Packagist,
you can simply require it from your test suite's `composer.json` file, and run
`composer update`! (Note: If you are still using Codeception 1, you will need
to run `php codecept.phar build`)

Then, as with any module, you just need to tell Codeception to use it for your
tests. For example, you could add it to your `acceptance.suite.yml`.

```
class_name: WebGuy
modules:
    enabled:
        - Hello
```

Now you can use your new test method from within your acceptance tests:

```php
$I->greet('Jordan'); // Prints: "Hello Jordan!"
```

## Getting fancy

Modules have some magic methods and attributes for things like configuration
values and hooks. Here is a list I have extracted from the [Modules and
Helpers](http://codeception.com/docs/03-ModulesAndHelpers) section of the
documentation:

```php
class Sample extends Module
{
    // HOOK: used after configuration is loaded
    public function _initialize() {
    }

    // HOOK: on every Guy class initialization
    public function _cleanup() {
    }

    // HOOK: before each suite
    public function _beforeSuite($settings = array()) {
    }

    // HOOK: after suite
    public function _afterSuite() {
    }

    // HOOK: before each step
    public function _beforeStep(\Codeception\Step $step) {
    }

    // HOOK: after each  step
    public function _afterStep(\Codeception\Step $step) {
    }

    // HOOK: before test
    public function _before(\Codeception\TestCase $test) {
    }

    // HOOK: after test
    public function _after(\Codeception\TestCase $test) {
    }

    // HOOK: on fail
    public function _failed(\Codeception\TestCase $test, $fail) {
    }
}
```

If you want to see another example, check out my [Codeception MailCatcher
Module](https://github.com/captbaritone/codeception-mailcatcher-module).
