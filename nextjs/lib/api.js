import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const postsDirectory = join(process.cwd(), "../_posts");
const pagesDirectory = join(process.cwd(), "../");

const FILE_NAME_PARSER = /^(\d{4}-\d{2}-\d{2})-([a-z0-9\_\.\-]+)\.md$/g;

function getSlugPostMap() {
  const map = {};
  for (const fileName of fs.readdirSync(postsDirectory)) {
    const matches = [...fileName.matchAll(FILE_NAME_PARSER)][0];
    if (matches == null) {
      throw new Error(`Incorrect filename for post. Got "${fileName}".`);
    }
    const [_, date, slug] = matches;
    map[slug] = { fileName, slug, date };
  }
  return map;
}

export function getPostBySlug(slug, fields = []) {
  const postInfo = getSlugPostMap()[slug];
  if (postInfo == null) {
    throw new Error(`Could not find file for slug "${slug}".`);
  }
  const fullPath = join(postsDirectory, `${postInfo.fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      yaml: (s) => yaml.safeLoad(s, { schema: yaml.JSON_SCHEMA }),
    },
  });

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = slug;
    }
    if (field === "date") {
      items[field] = postInfo.date;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export async function getAllPosts(fields = []) {
  const posts = Object.values(getSlugPostMap())
    .map(({ slug }) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date < post2.date ? "1" : "-1"));
  return posts;
}

export function getAllPages(fields = []) {
  return fs
    .readdirSync(pagesDirectory)
    .filter((fileName) => /\.md$/.test(fileName))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      if (slug == null) {
        throw new Error("No slug!");
      }
      return getPageBySlug(slug, fields);
    });
}

export function getPageBySlug(slug, fields = []) {
  const fullPath = join(pagesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      yaml: (s) => yaml.safeLoad(s, { schema: yaml.JSON_SCHEMA }),
    },
  });

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = slug;
    }
    if (field === "date") {
      items[field] = postInfo.date;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}
