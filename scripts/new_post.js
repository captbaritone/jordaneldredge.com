const path = require("path");
const fs = require("fs");
const { kebabCase } = require("lodash");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  return new Promise((resolve) => {
    readline.question("What is the title of the post? ", (name) => {
      resolve(name);
      readline.close();
    });
  });
}

async function main() {
  const title = await prompt();

  const template = `---
layout: post
title: "${title}"
summary: "Making a video that smoothly scrolls through 70k Winamp skins over the course of 12 hours"
summary_image: /images/scrolling-through-70k-winamp-skins-youtube-thumbnail.png
---`;

  // https://stackoverflow.com/a/29774197/1263117
  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);
  const prefix = today.toISOString().split("T")[0];

  const postPath = path.join(
    __dirname,
    `../_posts/${prefix}-${kebabCase(title)}.md`
  );

  fs.writeFileSync(postPath, template);
}
main();
