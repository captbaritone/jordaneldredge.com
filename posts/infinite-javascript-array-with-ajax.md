/*
Title: Infinite javascript array using AJAX
Description: 
Author: Jordan Eldredge
Date: 2014/02/10
*/

Last Halloween I made a [simple website] that combines nouns with sexy
adjectives to create Halloween costume ideas. Each refresh delivered a new
idea. It occurred to me that I could load the suggestions asynchronously via
a json api.

Here is the jQuery solution I came up with that allows the user to cycle
through as many suggestions as they want without having to ever wait for an
http request:

```javascript
// Start with an empty array of suggestions
var suggestions = [];

// A function to append 10 suggestions to our array
function getSuggestions() {
    $.getJSON( "api.php?count=10", function( data ) {
        suggestions = suggestions.concat( data );
    });
}

// Grab some suggestions right away
getSuggestions();

// Function to show a new suggestion, triggered by an `onClick` attribute
function refresh() {
    // If we don't have any suggestions
    if(suggestions.length == 0)
    {
        // Wait, then try again, we are waiting on the ajax call
        setTimeout(refresh, 100);
        return;
    }
    suggestion = suggestions.pop();

    // CODE TO UPDATE THE PAGE

    // If we have fewer than five suggestions left, fetch some more
    if(suggestions.length < 5) getSuggestions();
}
```

Check out the actual code on [GitHub].

[simple website]: http://whatthefuckshouldibeforhalloween.com
[GitHub]: https://github.com/captbaritone/whatthefuckshouldibeforhalloween/blob/master/index.php
