---
title: "Acceptance testing with Codeception and Vagrant"
tags: ["php"]
---

[Codeception] makes [Selenium] acceptance testing very easy, but getting it
working in my [Vagrant] workflow was something of a challenge. The main
question was:

> Should I run my tests from the host machine or the virtual machine?

Running the tests on the virtual machine would be a lot easier, but there is
one major problem: you have to use a headless browser for your Selenium tests.
I've had success with the headless browser [PhantomJS], but using a "real"
browser has one big selling point: You can get a screenshot of the website at
the point where it failed the test.

I've read that you _can_ setup Firefox to run headlessly, but it was so complex
I didn't think I'd be able to build it into my Vagrant provisioning script.

So, I've opted to run my test suite on my host machine. With acceptance
testing, that's easy enough. Just configure Codeception's [WebDriver] module to
access the site via your virtual server's host name. However, there is one
problem:

### Getting the database into a known state

Acceptance tests aren't much use if you don't know the state of the database.
Codeception addresses this problem with its [Db module] which can, among other
things, read in a database dump before each test.

However, to do that Codeception needs direct access to the database. Luckily,
Vagrant makes this possible. **Simply setup your virtual machine's mysql server
to accept non-localhost connections.** Then, configure Codeception to make
its database connection using the your virtual machine's host name.

My `acceptance.suite.yml` looks like this:

```yaml
class_name: WebGuy
modules:
  enabled:
    - WebDriver
    - Db
  config:
    WebDriver:
      url: "http://local.dev/"
      browser: firefox
    Db:
      dsn: "mysql:host=local.dev;dbname=testdb"
      user: "root"
      password: "vagrant"
      dump: "tests/_data/dump.sql"
      populate: true
      cleanup: true
```

[codeception]: http://codeception.com/
[selenium]: http://docs.seleniumhq.org/
[vagrant]: http://vagrantup.com
[phantomjs]: http://phantomjs.org/
[webdriver]: http://codeception.com/docs/modules/WebDriver
[db module]: http://codeception.com/docs/modules/Db
