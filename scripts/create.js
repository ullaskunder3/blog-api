#!/usr/bin/env node
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import readlineSync from "readline-sync";

// Cross-platform native GUI prompt function
function promptNative(message) {
  const platform = os.platform();

  if (platform === "win32") {
    // Windows - PowerShell + VB InputBox
    const command =
      `powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; ` +
      `[Microsoft.VisualBasic.Interaction]::InputBox('${message}', 'Create Post')"`;
    return execSync(command).toString().trim();
  } else if (platform === "darwin") {
    // macOS - AppleScript dialog
    try {
      const script = `osascript -e 'Tell application "System Events" to display dialog "${message}" default answer ""' -e 'text returned of result'`;
      return execSync(script).toString().trim();
    } catch {
      // fallback console input
      return readlineSync.question(`${message}\n> `);
    }
  } else if (platform === "linux") {
    // Linux - try zenity, fallback console
    try {
      const zenityCmd = `zenity --entry --title="Create Post" --text="${message}"`;
      return execSync(zenityCmd).toString().trim();
    } catch {
      return readlineSync.question(`${message}\n> `);
    }
  } else {
    // Other platforms - fallback console input
    return readlineSync.question(`${message}\n> `);
  }
}

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

function createNewPost() {
  try {
    // Use cross-platform native prompt
    const title = promptNative("Enter post title:");
    if (!title) return console.log("❌ Post creation cancelled.");

    const tags = promptNative("Enter tags (comma-separated):");
    const date =
      promptNative("Enter post date (YYYY-MM-DD):") ||
      new Date().toISOString().split("T")[0];

    const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : [];
    const slug = slugify(title);

    // Check for duplicate slug
    if (posts.find((p) => p.slug === slug)) {
      console.error(`❌ A post with slug "${slug}" already exists!`);
      return;
    }

    // Create post metadata
    const newPost = {
      id,
      title,
      slug,
      date,
      tags: tagsArray,
    };

    // Save to posts.json
    posts.push(newPost);
    fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 4), "utf-8");

    // Create MDX file
    const filename = `${slug}.mdx`;
    const filePath = path.join(POSTS_DIR, filename);

    const frontmatter =
      `---\n` +
      `title: "${title}"\n` +
      `subtitle: ""\n` +
      `id: ${id}\n` +
      `date: "${date}"\n` +
      `tag:\n${tagsArray.map((t) => `  - ${t}`).join("\n")}\n---\n\n` +
      `# ${title}\n\nWrite your content here...\n`;

    fs.writeFileSync(filePath, frontmatter, "utf-8");

    console.log(`✅ Created new post: ${filename} (id: ${id})`);
    console.log(`✅ Updated posts.json`);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
}

createNewPost();
