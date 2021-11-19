---
layout: post
title: "The game Snake in 90 lines of JavaScript"
summary: I wrote a minimal implementation of the game Snake in JavaScript
github_comments_issue_id: 12
---

After watching [Coding an HTML5 Game in 5 min 30
sec](https://www.youtube.com/watch?v=KoWqdEACyLI) in which Chris DeLeon
programs a Pong clone in Notepad, I was inspired to write a game myself.
I opted to clone Snake and took a minimal approach. My goal was to do it with
as little code as possible while still keeping the code very readable.

Obviously this is highly subjective, but I think I found a balance where there
is hardly any extraneous code, but anyone with a small amount of JavaScript
experience could read thought the code and understand everything.

__Play the game [here](https://rawgit.com/captbaritone/snake.js/master/index.html)__

```javascript
(function() {
  var SIZE = 500; // Size of the play-field in pixels
  var GRID_SIZE = SIZE / 50;
  var c = document.getElementById('c');
  c.height = c.width = SIZE * 2; // 2x our resolution so retina screens look good
  c.style.width = c.style.height = SIZE + 'px';
  var context = c.getContext('2d');
  context.scale(2, 2); // Scale our canvas for retina screens

  var direction = newDirection = 1; // -2: up, 2: down, -1: left, 1: right
  var snakeLength = 5;
  var snake = [{x: SIZE / 2, y: SIZE / 2}]; // Snake starts in the center
  var candy = null;
  var end = false;

  function randomOffset() {
    return Math.floor(Math.random() * SIZE / GRID_SIZE) * GRID_SIZE;
  }

  function stringifyCoord(obj) {
    return [obj.x, obj.y].join(',');
  }

  function tick() {
    var newHead = {x: snake[0].x, y: snake[0].y};

    // Only change directon if the new direction is a different axis
    if (Math.abs(direction) !== Math.abs(newDirection)) {
      direction = newDirection;
    }
    var axis = Math.abs(direction) === 1 ? 'x' : 'y'; // 1, -1 are X; 2, -2 are Y
    if (direction < 0) {
      newHead[axis] -= GRID_SIZE; // Move left or down
    } else {
      newHead[axis] += GRID_SIZE; // Move right or up
    }

    // Did we eat a candy? Detect if our head is in the same cell as the candy
    if (candy && candy.x === newHead.x && candy.y === newHead.y) {
      candy = null;
      snakeLength += 20;
    }

    context.fillStyle = '#002b36';
    context.fillRect(0, 0, SIZE, SIZE); // Reset the play area
    if (end) {
      context.fillStyle = '#eee8d5';
      context.font = '40px serif';
      context.textAlign = 'center';
      context.fillText('Refresh to play again', SIZE / 2, SIZE / 2);
    } else {
      snake.unshift(newHead); // Add the new head to the front
      snake = snake.slice(0, snakeLength); // Enforce the snake's max length
    }

    // Detect wall collisions
    if (newHead.x < 0 || newHead.x >= SIZE || newHead.y < 0 || newHead.y >= SIZE) {
      end = true;
    }

    context.fillStyle = '#268bd2';
    var snakeObj = {};
    for (var i = 0; i < snake.length; i++) {
      var a = snake[i];
      context.fillRect(a.x, a.y, GRID_SIZE, GRID_SIZE); // Paint the snake
      // Build a collision lookup object
      if (i > 0) snakeObj[stringifyCoord(a)] = true;
    }

    if (snakeObj[stringifyCoord(newHead)]) end = true; // Collided with our tail

    // Place a candy (not on the snake) if needed
    while (!candy || snakeObj[stringifyCoord(candy)]) {
      candy = {x: randomOffset(), y: randomOffset()};
    }

    context.fillStyle = '#b58900';
    context.fillRect(candy.x, candy.y, GRID_SIZE, GRID_SIZE); // Paint the candy
  }

  window.onload = function() {
    setInterval(tick, 100); // Kick off the game loop!
    window.onkeydown = function(e) {
      newDirection = {37: -1, 38: -2, 39: 1, 40: 2}[e.keyCode] || newDirection;
    };
  };
})();
```

You can contribute to the code [on GitHub](https://github.com/captbaritone/snake.js)
