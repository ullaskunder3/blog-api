#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Paths
const POSTS_JSON = path.join(process.cwd(), "data", "posts.json");
const POSTS_DIR = path.join(process.cwd(), "data", "posts");

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(POSTS_JSON)) {
  fs.writeFileSync(POSTS_JSON, "[]", "utf-8");
}

// Read existing posts
const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf-8"));

// Get next ID
const id = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

// --- CLI Args ---
const args = process.argv.slice(2);
if (!args.length) {
  console.error("❌ Please provide a blog title.");
  process.exit(1);
}

const title = args[0];

// Optional fields
const tagsArg = args.find((arg) => arg.startsWith("--tags="));
const tags = tagsArg
  ? tagsArg
      .split("=")[1]
      .split(",")
      .map((t) => t.trim())
  : [];

const dateArg = args.find((arg) => arg.startsWith("--date="));
const date = dateArg
  ? dateArg.split("=")[1]
  : new Date().toISOString().split("T")[0];

// Slugify function
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const slug = slugify(title);

// Check if slug already exists
if (posts.find((p) => p.slug === slug)) {
  console.error(`❌ A post with slug "${slug}" already exists!`);
  process.exit(1);
}

// Create new post metadata
const newPost = {
  id,
  title,
  slug,
  date,
  tags,
};

// Write to posts.json
posts.push(newPost);
fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 4), "utf-8");

// Create MDX file
const filename = `${slug}.mdx`;
const filePath = path.join(POSTS_DIR, filename);

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

fs.writeFileSync(filePath, frontmatter, "utf-8");

console.log(`✅ Created new post: ${filename} (id: ${id})`);
console.log(`✅ Updated posts.json`);
