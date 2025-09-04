#!/usr/bin/env node
import fs from "fs";
import path from "path";

const POSTS_DIR = process.cwd();

function extractFrontmatter(content) {
  const idMatch = content.match(/id:\s*(\d+)/);
  const titleMatch = content.match(/title:\s*"(.*?)"/);
  const dateMatch = content.match(/date:\s*"(.*?)"/);

  return {
    id: idMatch ? parseInt(idMatch[1], 10) : null,
    title: titleMatch ? titleMatch[1] : "Untitled",
    date: dateMatch ? dateMatch[1] : "Unknown",
  };
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

let lastPost = null;

for (const file of files) {
  const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
  const meta = extractFrontmatter(content);
  if (!lastPost || (meta.id && meta.id > lastPost.id)) {
    lastPost = { ...meta, file };
  }
}

if (lastPost) {
  console.log("📄 Last Post:");
  console.log(`- ID: ${lastPost.id}`);
  console.log(`- Title: ${lastPost.title}`);
  console.log(`- Date: ${lastPost.date}`);
  console.log(`- File: ${path.join(POSTS_DIR, lastPost.file)}`);
} else {
  console.log("❌ No posts found.");
}
