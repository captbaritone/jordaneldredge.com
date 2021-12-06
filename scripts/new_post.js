const path = require("path");
const fs = require("fs");
const { kebabCase } = require("lodash");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    readline.question(`${question} `, (name) => {
      resolve(name);
    });
  });
}

async function main() {
  const title = await prompt("What is the title of the post?");
  const summary = await prompt("What is the summary of the post?");
  readline.close();

  const template = `---
title: "${title}"
summary: "${summary}"
summary_image: <FIXME>
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
