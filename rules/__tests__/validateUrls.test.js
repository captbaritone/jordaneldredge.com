const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

async function urlStatus(url, timeoutms = 3000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutms); // will time out after 1000ms
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: "HEAD",
    });
    return response.status;
  } catch (e) {
    return e.message;
  } finally {
    clearTimeout(timeout);
  }
}

function readJson(filePath) {
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
  return JSON.parse(fileContent || "[]");
}

async function withJson(filePath, cb) {
  const json = readJson(filePath);
  const newJson = await cb(json);
  const newFileContent = JSON.stringify(newJson, null, 2);
  fs.writeFileSync(filePath, newFileContent);
}

test("Validate link URLs", async () => {
  const linksPath = path.join(__dirname, "..", "links.json");
  await withJson(linksPath, async (existing) => {
    const todo = Object.entries(existing)
      .filter(([key, value]) => value === "unverified")
      .slice(0, 50);

    const jobs = todo.map(async ([key, value]) => {
      const status = await urlStatus(key, 4000);
      existing[key] = {
        status,
      };
    });

    await Promise.all(jobs);

    return existing;
  });

  const existing = readJson(linksPath);
  const invalidUrls = Object.entries(existing)
    .filter(([key, value]) => {
      return value.status !== 200;
    })
    .map(([key]) => key);
  invalidUrls.sort();
  expect(invalidUrls).toMatchSnapshot();
});
