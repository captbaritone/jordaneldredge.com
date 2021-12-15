import path from "path";
import fs from "fs";

const __dirname = path.resolve();

export function withJson(filePath, cb) {
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
  const json = JSON.parse(fileContent || "[]");
  const newJson = cb(json);
  const newFileContent = JSON.stringify(newJson, null, 2);
  fs.writeFileSync(filePath, newFileContent);
}

export function recordLink(value) {
  withJson(path.join(__dirname, "rules/links.json"), (previous = {}) => {
    if (previous[value] == null) {
      previous[value] = "unverified";
    }
    return previous;
  });
}
