import remark from "remark";
import html from "remark-html";
import prism from "remark-prism";

const CONSTANTS = {
  "site.email": "jordan@jordaneldredge.com",
  "site.twitter_username": "captbaritone",
  "site.github_username": "captbaritone",
  "site.url": "https://jordaneldredge.com",
  "site.baseurl": "", // Is this right?
  // TODO: Remove this. We try to avoid ever parsing this by using {% raw %}, but we don't support {% raw %}, so we hack here to ignore it.
  // _posts/2015-08-30-jerkll-a-tiny-static-site-generator-that-runs-in-your-browser.md
  "(\\S*)": "(\\S*)",
};

// These are all hacks to be able to process the wildcard stuff we do in Jekyll but don't work in nextjs
function preprocess(markdown) {
  return markdown
    .replace("{% raw %}", "")
    .replace("{% endraw %}", "")
    .replace(/\{\{ "([^"]+)" \| prepend: ([^}]+) \}\}/g, (_, url, key) => {
      const value = CONSTANTS[key];
      if (value == null) {
        throw new Error(`Could not find constant value for key "${key}"`);
      }
      return value + url;
    })
    .replace(/\{\{ ([^}]+) \}\}/g, (_, key) => {
      const value = CONSTANTS[key];
      if (value == null) {
        throw new Error(`Could not find constant value for key "${key}"`);
      }
      return value;
    })
    .replace(/\{% ([^ ]+) ([^ ]+) %\}/g, (_, name, token) => {
      if (name !== "youtube") {
        throw new Error(`Unknown short code "${name}" with value "${token}"`);
      }
      return `<div class='video-container'>
        <iframe src="https://www.youtube.com/embed/${token}?modestbranding=1&rel=0" frameborder="0" allowfullscreen class='youtube-video'></iframe>
      </div>`;
    });
}

export default async function markdownToHtml(markdown) {
  const processedMarkdown = preprocess(markdown);

  const result = await remark().use(html).use(prism).process(processedMarkdown);
  return result.toString();
}
