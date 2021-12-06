import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import path from "path";
import fs from "fs";
import http from "http";
import { parse } from "url";

const __dirname = path.resolve();
import yaml from "js-yaml";

const validateMetadata = lintRule(
  "remark-lint:validate-metadata",
  async (tree, file, options) => {
    const filePath = file.history[0];
    if (filePath.startsWith("_posts")) {
      const slug = path.parse(filePath).name;
      // TODO: Dissallow _
      if (!slug.match(/^[a-z0-9]([a-z0-9]|-|_|\.)*[a-z0-9]$/)) {
        file.message(`Invalid post filename: "${slug}"`, tree);
      }
    }
    visit(tree, "yaml", (node) => {
      const frontmatter = yaml.safeLoad(node.value, {
        schema: yaml.JSON_SCHEMA,
      });
      for (const [key, value] of Object.entries(frontmatter)) {
        switch (key) {
          case "summary_image":
            if (value.startsWith("/images/")) {
              const imagePath = path.join(__dirname, "public", value);
              const exists = fs.existsSync(imagePath);
              if (!exists) {
                file.message(`Local image does not exist: "${value}"`, node);
              }
            } else {
              // TODO: Move these home
            }
            break;
          case "github_comments_issue_id":
            if (!(typeof value === "number")) {
              file.message(
                `Expected github_comments_issue_id to be a number.`,
                node
              );
            }
            break;
          case "summary":
          case "title":
          case "youtube_slug":
          case "alias":
          case "archive":
          case "date":
            break;
          default:
            file.message(`Unexpected metadata key: "${key}"`, node);
        }
      }
    });
  }
);

export default validateMetadata;
