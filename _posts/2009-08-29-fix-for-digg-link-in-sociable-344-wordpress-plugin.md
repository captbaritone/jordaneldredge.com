---
title: "Fix For Digg Link in Sociable 3.4.4 Wordpress Plugin "
layout: post
archive: true
---

As you can probably see I <span style="text-decoration: line-through;">use</span> used to use the Sociable plugin on this blog. I recently realized that the Digg link was broken. Here is the fix:

Line 133 in wp-content/plugins/sociable/sociable.php reads:

<pre lang='PHP' line='0'>'url' =&gt; 'http://digg.com/submit?phase=2&amp;amp;url=PERMALINK&amp;amp;title=TITLE&amp;amp;bodytext=EXCERPT',</pre>

Replace it with this:

<pre lang='PHP' line='0'>'url' =&gt; 'http://digg.com/submit?url=PERMALINK&amp;amp;title=TITLE&amp;amp;bodytext=EXCERPT',</pre>

Or use this diff file on wp-content/plugins/sociable/sociable.php
<a href="http://jordaneldredge.com/uploads/2009/08/sociable.php.diggFix.diff">sociable.php.diggFix</a>
