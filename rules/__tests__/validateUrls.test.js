const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

async function urlExists(url, timeoutms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutms); // will time out after 1000ms
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: "HEAD",
    });
    if (response.status !== 200) {
      console.log(response.status, url);
    }
    return response.status === 200;
  } catch {
    return false;
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

test("Validate image URLs", async () => {
  const imagesPath = path.join(__dirname, "..", "images.json");
  await withJson(imagesPath, async (existing) => {
    const todo = Object.entries(existing).filter(
      ([key, value]) => value === "unverified"
    );

    const jobs = todo.map(async ([key, value]) => {
      const url = "https://jordaneldredge.com" + key;
      const exists = await urlExists(url, 1000);
      existing[key] = exists ? "exists" : "notfound";
    });

    await Promise.all(jobs);
    return existing;
  });

  const existing = readJson(imagesPath);
  const values = Object.values(existing);
  const all = values.every((v) => v === "exists");
  expect(all).toBe(true);
});

test("Validate link URLs", async () => {
  const linksPath = path.join(__dirname, "..", "links.json");
  await withJson(linksPath, async (existing) => {
    const todo = Object.entries(existing)
      .filter(([key, value]) => value === "unverified")
      .slice(0, 50);

    const jobs = todo.map(async ([key, value]) => {
      const exists = await urlExists(key, 1000);
      existing[key] = exists ? "exists" : "notfound";
    });

    await Promise.all(jobs);

    return existing;
  });

  const existing = readJson(linksPath);
  const invalidUrls = Object.entries(existing)
    .filter(([key, value]) => value !== "exists")
    .map(([key]) => key);
  invalidUrls.sort();
  expect(invalidUrls).toMatchSnapshot();
});
