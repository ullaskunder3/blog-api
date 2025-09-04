#!/usr/bin/env node
import fs from "fs";
import path from "path";

const POSTS_DIR = process.cwd();

const extractId = (content) => {
  const match = content.match(/id:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const getNextId = () => {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  return (
    files
      .map((file) =>
        extractId(fs.readFileSync(path.join(POSTS_DIR, file), "utf-8"))
      )
      .filter(Boolean)
      .reduce((max, id) => Math.max(max, id), 0) + 1
  );
};

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const args = process.argv.slice(2);
if (!args.length) {
  console.error("❌ Please provide a blog title.");
  process.exit(1);
}

const title = args[0];

// Tags parsing (supports --tag=value or --tag value)
const tags = (() => {
  const eqArg = args.find(
    (arg) => arg.startsWith("--tag=") || arg.startsWith("--tags=")
  );
  if (eqArg)
    return eqArg
      .split("=")[1]
      .split(",")
      .map((t) => t.trim());

  const idxArg = args.findIndex((arg) => arg === "--tag" || arg === "--tags");
  if (idxArg !== -1 && args[idxArg + 1])
    return args[idxArg + 1].split(",").map((t) => t.trim());

  return [];
})();

const id = String(getNextId()).padStart(3, "0");
const slug = slugify(title);
const date = new Date().toISOString().split("T")[0];

const frontmatter = `---
title: "${title}"
subtitle: ""
id: ${id}
date: "${date}"
tag: [${tags.map((t) => `"${t}"`).join(", ")}]
---

# ${title}

Write your content here...
`;

const filename = `${slug}.mdx`;
fs.writeFileSync(path.join(POSTS_DIR, filename), frontmatter, "utf-8");

console.log(`✅ Created new post: ${filename} with id ${id}`);
