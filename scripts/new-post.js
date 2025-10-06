#!/usr/bin/env node
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// --- Paths ---
const ROOT = process.cwd();
const POSTS_JSON = path.join(ROOT, "data", "posts.json");
const POSTS_DIR = path.join(ROOT, "data", "posts");

// --- Ensure Directories Exist ---
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(POSTS_JSON)) fs.writeFileSync(POSTS_JSON, "[]", "utf-8");

// --- Read Existing Posts ---
const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf-8"));

// --- CLI Args ---
const args = process.argv.slice(2);
if (!args.length) {
  console.error("❌ Please provide a blog title.");
  process.exit(1);
}

const title = args[0];

// Optional Args
const tagsArg = args.find((a) => a.startsWith("--tags="));
const tags = tagsArg
  ? tagsArg
      .split("=")[1]
      .split(",")
      .map((t) => t.trim())
  : [];

const dateArg = args.find((a) => a.startsWith("--date="));
const date = dateArg
  ? dateArg.split("=")[1]
  : new Date().toISOString().split("T")[0];

// --- Slugify Function ---
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// --- Create New Post Metadata ---
const slug = slugify(title);

if (posts.find((p) => p.slug === slug)) {
  console.error(`❌ A post with slug "${slug}" already exists!`);
  process.exit(1);
}

const id = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

const newPost = {
  id,
  title,
  slug,
  date,
  tags,
};

// --- Update posts.json ---
posts.push(newPost);
fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 4), "utf-8");

// --- Create MDX File ---
const filename = `${slug}.mdx`;
const filePath = path.join(POSTS_DIR, filename);

const frontmatter =
  `---\n` +
  `title: "${title}"\n` +
  `subtitle: ""\n` +
  `id: ${id}\n` +
  `date: "${date}"\n` +
  `tag:\n${tags.map((t) => `  - ${t}`).join("\n")}\n` +
  `---\n\n# ${title}\n\nWrite your content here...\n`;

fs.writeFileSync(filePath, frontmatter, "utf-8");

console.log(`✅ Created new post: ${filename} (id: ${id})`);
console.log(`✅ Updated posts.json`);

// ======================================================
// 🧭 Auto-update next/prev navigation in all .mdx posts
// ======================================================
function getNavSlugs(index) {
  const prev = posts[(index - 1 + posts.length) % posts.length].slug;
  const next = posts[(index + 1) % posts.length].slug;
  return { prev, next };
}

posts.sort((a, b) => a.id - b.id);

posts.forEach((post, index) => {
  const mdxPath = path.join(POSTS_DIR, `${post.slug}.mdx`);
  if (!fs.existsSync(mdxPath)) return;

  const content = fs.readFileSync(mdxPath, "utf8");
  const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!fmMatch) return;

  const yamlBlock = fmMatch[1];
  const fmData = yaml.load(yamlBlock) || {};

  const { prev, next } = getNavSlugs(index);
  fmData.prev = prev;
  fmData.next = next;

  const updatedYaml = yaml.dump(fmData, { lineWidth: -1 }).trim();
  const updatedContent = `---\n${updatedYaml}\n---\n${content
    .slice(fmMatch[0].length)
    .trimStart()}\n`;

  fs.writeFileSync(mdxPath, updatedContent, "utf8");
  console.log(`🔗 Updated navigation for: ${post.slug}.mdx`);
});

console.log("\n🎉 All posts updated with next/prev navigation links!");
