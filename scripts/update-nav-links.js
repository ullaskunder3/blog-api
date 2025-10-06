/**
 * Update frontmatter in all .mdx files with next/prev slugs.
 * It reads data/posts.json to determine order.
 *
 * Run: node scripts/update-nav-links.js
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const postsPath = path.join(process.cwd(), "data", "posts");
const jsonPath = path.join(process.cwd(), "data", "posts.json");

// Load posts.json
const posts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Sort by id to maintain consistent order
posts.sort((a, b) => a.id - b.id);

function getNavSlugs(index) {
  const prev = posts[(index - 1 + posts.length) % posts.length].slug;
  const next = posts[(index + 1) % posts.length].slug;
  return { prev, next };
}

posts.forEach((post, index) => {
  const filePath = path.join(postsPath, `${post.slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Missing file for slug: ${post.slug}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Match YAML frontmatter block
  const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/);

  if (!fmMatch) {
    console.warn(`⚠️ No frontmatter found in ${filePath}`);
    return;
  }

  const yamlBlock = fmMatch[1];
  const fmData = yaml.load(yamlBlock);

  // Compute next/prev slugs
  const { prev, next } = getNavSlugs(index);

  // Update fields
  fmData.prev = prev;
  fmData.next = next;

  // Rebuild frontmatter
  const updatedYaml = yaml.dump(fmData, { lineWidth: -1 }).trim();

  // Replace original frontmatter
  const updatedContent = `---\n${updatedYaml}\n---\n${content
    .slice(fmMatch[0].length)
    .trimStart()}\n`;

  // Write back to file
  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`✅ Updated ${post.slug}.mdx`);
});

console.log("\n🎉 All posts updated with next/prev navigation!");
