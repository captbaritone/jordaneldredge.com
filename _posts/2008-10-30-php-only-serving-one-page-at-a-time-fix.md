---
title: "Php only serving one page at a time [fix!]"
tags: [php]
---

After years of confusion I finally found the solution to why php was only serving one page at a time.

When you execute [session_start()](http://us2.php.net/manual/en/function.session-start.php) the session array for that user gets locked to prevent concurrent write errors. Until the script finishes or you run[ session_write_close()](http://us2.php.net/manual/en/function.session-write-close.php) any other script that tries to access that session will stall.

So, the fix is to run session_write_close() after you are done writing session data but **before** anything time consuming (large shell_exec()s, sql querys, downloads).
