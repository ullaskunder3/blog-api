#!/usr/bin/env node
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "data", "posts");

const args = process.argv.slice(2);
let searchId = null;

// Parse --id argument
args.forEach((arg, i) => {
  if (arg.startsWith("--id=")) {
    searchId = parseInt(arg.split("=")[1], 10);
  } else if (arg === "--id" && args[i + 1]) {
    searchId = parseInt(args[i + 1], 10);
  }
});

if (!searchId) {
  console.error("❌ Please provide an ID with --id");
  process.exit(1);
}

// Extract frontmatter from content
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

// Search for post with the given ID
const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
let foundPost = null;

for (const file of files) {
  const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
  const meta = extractFrontmatter(content);
  if (meta.id === searchId) {
    foundPost = { ...meta, file };
    break;
  }
}

if (foundPost) {
  console.log("📄 Post Found:");
  console.log(`- ID: ${foundPost.id}`);
  console.log(`- Title: ${foundPost.title}`);
  console.log(`- Date: ${foundPost.date}`);
  console.log(`- File: ${path.join(POSTS_DIR, foundPost.file)}`);
} else {
  console.log(`❌ No post found with ID ${searchId}`);
}
