// scripts/add-cdn-url.js
import fs from "fs";
import path from "path";

const REPO_OWNER = "ullaskunder3";
const REPO_NAME = "blog-api";
const BRANCH = "main";

// The base CDN URL for images located in /data/img
const mdxCdnBase = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/data/img/`;

// The base CDN URL for images located in /data/images/projects (for json files)
const jsonCdnBase = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/data/images/projects/`;

const postsPath = path.join("data", "posts");

function updateMdxFiles() {
  const files = fs.readdirSync(postsPath);
  
  files.forEach((file) => {
    if (!file.endsWith(".mdx")) return;
    
    const filePath = path.join(postsPath, file);
    let content = fs.readFileSync(filePath, "utf-8");
    
    // Regex to match markdown images: ![alt_text](../img/filename.png) or ![alt_text](/data/img/filename.png)
    // We only want to replace local URLs, not existing http/https URLs.
    const markdownImageRegex = /!\[([^\]]*)\]\((?!http)(.*?\/img\/)([^)]+)\)/g;
    
    const updatedContent = content.replace(markdownImageRegex, (match, altText, pathBeforeFilename, filename) => {
      const cdnUrl = mdxCdnBase + filename;
      return `![${altText}](${cdnUrl})`;
    });

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, "utf-8");
      console.log(`✅ Updated images in ${filePath} to CDN URLs`);
    }
  });
}

// Helper to update a single JSON file (array or object)
function updateJsonFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const updateItem = (item) => {
    // Update coverImage
    if (item.coverImage && !item.coverImage.startsWith("http")) {
      const filename = path.basename(item.coverImage);
      item.coverImage = jsonCdnBase + filename;
    }

    // Update images array (if exists)
    if (item.images && Array.isArray(item.images)) {
      item.images = item.images.map((img) => {
        if (!img.url.startsWith("http")) {
          const filename = path.basename(img.url);
          return { ...img, url: jsonCdnBase + filename };
        }
        return img;
      });
    }
  };

  if (Array.isArray(data)) {
    data.forEach(updateItem);
  } else if (typeof data === "object" && data !== null) {
    updateItem(data);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  console.log(`✅ Updated ${filePath}`);
}

console.log("Updating MDX files...");
updateMdxFiles();

console.log("Updating JSON files...");
fs.readdirSync(postsPath).forEach((file) => {
  if (!file.endsWith(".json")) return;
  updateJsonFile(path.join(postsPath, file));
});

const projectsFile = path.join("data", "projects.json");
if (fs.existsSync(projectsFile)) {
  updateJsonFile(projectsFile);
}

