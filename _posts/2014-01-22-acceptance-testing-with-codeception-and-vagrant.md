---
title: "Acceptance testing with Codeception and Vagrant"
layout: post
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

I've read that you *can* setup Firefox to run headlessly, but it was so complex
I didn't think I'd be able to build it into my Vagrant provisioning script.

So, I've opted to run my test suite on my host machine. With acceptance
testing, that's easy enough. Just configure Codeception's [WebDriver] module to
access the site via your virtual server's host name.  However, there is one
problem:

### Getting the database into a known state

Acceptance tests aren't much use if you don't know the state of the database.
Codeception addresses this problem with it's [Db module] which can, among other
things, read in a database dump before each test.

However, to do that Codeception needs direct access to the database. Luckily,
Vagrant makes this possible. **Simply setup your virtual machine's mysql server
to accept non-localhost connections.** Then, configure Codeception to make
it's database connection using the your virtual machine's host name.

My `acceptance.suite.yml` looks like this:

    class_name: WebGuy
    modules:
        enabled:
            - WebDriver
            - Db
        config:
            WebDriver:
                url: 'http://local.dev/'
                browser: firefox
            Db:
                dsn: 'mysql:host=local.dev;dbname=testdb'
                user: 'root'
                password: 'vagrant'
                dump: 'tests/_data/dump.sql'
                populate: true
                cleanup: true


[Codeception]: http://codeception.com/
[Selenium]: http://docs.seleniumhq.org/
[Vagrant]: http://vagrantup.com
[PhantomJS]: http://phantomjs.org/
[WebDriver]: http://codeception.com/docs/modules/WebDriver
[Db module]: http://codeception.com/docs/modules/Db
