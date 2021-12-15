import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import path from "path";
import fs from "fs";
import { recordLink } from "./ruleUtils.mjs";

const __dirname = path.resolve();

const validPostNames = new Set(
  fs.readdirSync(path.join(__dirname, "_posts")).map((fileName) => {
    return fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  })
);

const validUrl = /^(\/.+)|(https?:\/\/.+)|(mailto:.+)$/;

const validateUrls = lintRule(
  "remark-lint:validate-urls",
  async (tree, file, options) => {
    const promises = [];
    visit(tree, ["image", "link"], (node) => {
      let { url } = node;
      if (!validUrl.test(url)) {
        file.message(`Invalid URL: "${url}"`, node);
        return;
      }
      if (url.startsWith("http://jordaneldredge.com")) {
        file.message(`Invalid non-https jordaneldredge.com link`, node);
        return;
      }
      if (url.startsWith("mailto:")) {
        // Okay
      } else if (
        url.startsWith("/") ||
        url.startsWith("https?://jordaneldredge.com")
      ) {
        url = url.replace(/https?:\/\/jordaneldredge.com/, "");
        if (
          url.startsWith("/images/") ||
          url.startsWith("/content") ||
          url.startsWith("/uploads")
        ) {
          const imagePath = path.join(__dirname, "public", url);
          const exists = fs.existsSync(imagePath);
          if (!exists) {
            file.message(`Local image does not exist: "${node.url}"`, node);
          }
        } else if (url.startsWith("/blog/")) {
          const trimmed = url.replace(/(\/$)/, "").replace(/^\/blog\//, "");
          if (!validPostNames.has(trimmed)) {
            file.message(`Local post does not exist: "${trimmed}"`, node);
          }
        } else if (/^\/[^/]+\/?$/.test(url)) {
          // Single word link
          const trimmed = url.replace(/\//g, "");
          const names = [
            path.join("_pages", trimmed + ".md"),
            path.join("pages", trimmed + ".js"),
            path.join("pages", trimmed + "/index.js"),
          ];
          const exists = names.some((name) => {
            return fs.existsSync(path.join(__dirname, name));
          });
          if (!exists) {
            file.message(`Local image does not exist: "${trimmed}"`, node);
          }
        } else {
          // console.log(url);
        }
      } else {
        recordLink(url);
      }
    });
    // TODO: Unclear if these are actually checked
    await Promise.all(promises);
  }
);

export default validateUrls;
