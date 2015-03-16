---
title: "Speeding up Laravel tests with database transactions"
layout: post
---

I shamelessly test my controllers by writing functional tests which depend on
a known set of seed data in my database. However, this approach is **slow**.
Reseeding the database before each and every test drags the test time down to
a crawl. After coming across a comment by [Jeffery
Way](http://fideloper.com/laravel-database-transactions#comment-1179301604),
I found that I can drastically speed up my tests by using database
transactions.

The idea is to use Laravel's support for database transactions to encapsulate
the queries run by each test into a single transaction and then roll back that
transaction before running the next step, thus cheaply returning the database
to a known state.

It only take two small steps to setup and **cut my test suite run time from two
minutes to 15 seconds**:

## 1. Seed the database once before any of the tests are run

This actually proved harder than I thought. My current solution, which is
a total hack, is to create a custom boostrap file which shells out to run the
artisan seed command before beginning any testing:

```php
<?php

// bootstrap/testingAutoload.php

passthru("php artisan --env='testing' migrate --seed");
require __DIR__ . '/autoload.php';
```

Then I change my `phpunit.xml` to use that boostrap file instead:

```xml
<phpunit
...
		bootstrap="bootstrap/testingAutoload.php"
...
>
```

## 2. Encapsulate each test in a transaction

I then add these `setUp()` and `tearDown()` methods to the `TestCase` class
which Laravel gives us:

```php
public function setUp()
{
	parent::setUp();
	DB::beginTransaction();
}
public function tearDown()
{
	parent::tearDown();
	DB::rollBack();
}
```

## Further considerations

1. Since the database seeding is done in the boostrap file, any time I want to run
a test, I have to wait for the database to seed, even if it's just a tiny unit
test which does not touch the database.

2. I'm not sure how well this approach works if you are already employing database
transactions within in your app.

3. You could easily add the transaction setup/teardown methods to
a `DatabaseTestCase` class which extends `TestCase` and then any tests which
need the database could extend `DatabaseTestClass`. That way you won't be
needlessly running the transactions for your unit tests.

## Feedback

If you have any thought or suggestions, I'd love to hear from you:
[@captbaritone](http://twitter.com/captbaritone)
