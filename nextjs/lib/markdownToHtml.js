import remark from "remark";
import html from "remark-html";
import prism from "remark-prism";

const CONSTANTS = {
  "site.email": "jordan@jordaneldredge.com",
  "site.twitter_username": "captbaritone",
  "site.github_username": "captbaritone",
  "site.url": "https://jordaneldredge.com",
};

function preprocess(markdown) {
  return markdown.replace(/\{\{ ([^}]+) \}\}/g, (_, key) => {
    const value = CONSTANTS[key];
    if (value == null) {
      throw new Error(`Could not find constant value for key "${key}"`);
    }
    return value;
  });
}

export default async function markdownToHtml(markdown) {
  const processedMarkdown = preprocess(markdown);

  const result = await remark().use(html).use(prism).process(processedMarkdown);
  return result.toString();
}
