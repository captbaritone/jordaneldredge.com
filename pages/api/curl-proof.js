// https://jordaneldredge.com/blog/one-way-curl-pipe-sh-install-scripts-can-be-dangerous/
export default function handler(req, res) {
  res.status(200).send(`#!/bin/sh\n${getMessage(req)}`);
}

function getMessage(req) {
  const ua = req.headers["user-agent"];
  if (ua != null && ua.includes("curl")) {
    return `echo "I am an EVIL script!!!!"\n`;
  } else {
    return `echo "I am a peaceful script"\n`;
  }
}
