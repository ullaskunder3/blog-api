#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

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

// Slugify function
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function createNewPost() {
  try {
    // Prompt for post details
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the post title:",
      },
      {
        type: "input",
        name: "tags",
        message: "Enter tags (comma-separated):",
        default: "",
      },
      {
        type: "input",
        name: "date",
        message: "Enter the post date (YYYY-MM-DD):",
        default: new Date().toISOString().split("T")[0],
      },
    ]);

    const { title, tags, date } = answers;

    const tagsArray = tags.split(",").map((t) => t.trim());
    const slug = slugify(title);

    // Check if slug already exists
    if (posts.find((p) => p.slug === slug)) {
      console.error(`❌ A post with slug "${slug}" already exists!`);
      return;
    }

    // Create new post metadata
    const newPost = {
      id,
      title,
      slug,
      date,
      tags: tagsArray,
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
tag:
${tagsArray.map((t) => `  - ${t}`).join("\n")}
---


# ${title}

Write your content here...
`;

    fs.writeFileSync(filePath, frontmatter, "utf-8");

    console.log(`✅ Created new post: ${filename} (id: ${id})`);
    console.log(`✅ Updated posts.json`);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("\n❌ Prompt was canceled by the user.");
    } else {
      console.error(error);
    }
  }
}

createNewPost();
