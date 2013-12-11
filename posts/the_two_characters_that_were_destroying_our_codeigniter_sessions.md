/*
Title: The two characters that were destroying our CodeIgniter sessions
Description:
Author: Jordan Eldredge
Date: 2013/12/10
*/

In a [CodeIgniter] project I was working on for work had a strange bug where
users were getting mysteriously logged out. After hours of debugging I was able
to narrow it down to it's minimal reproduceable form:

    $this->session->set_userdata('example_session_value', array('\/'));

Running that line of code will render the current session irretrievable. We
were running version 2.1.3. I also tried the most recent stable version (2.1.4)
and the bug persists. However, the current development branch seems immune to
the bug.

While I don't exactly understand why it breaks, it has something to do with the
escaping CodeIgniter does before it serializes the session array to store it in
the database.

[CodeIgniter]: http://ellislab.com/codeigniter

