# LeetCode Blog Generation Guide

This document provides instructions for AI assistants to automatically generate blog posts from LeetCode solution notes.

## 🚀 Workflow

When a user provides LeetCode content, follow these steps:

### 1. Initialize the Post
Run the `scripts/new-post.js` script to create the file and update `posts.json`.
- **Title:** "LeetCode [Number]: [Problem Name]"
- **Tags:** `leetcode, python, dsa, [Topic], interview`
- **Subtitle:** A 1-sentence summary of the key insight.

```bash
node scripts/new-post.js "LeetCode [Number]: [Name]" --tags=leetcode,python,dsa,... --subtitle="..."
```

### 2. Structure the MDX Content
Follow the template used in `leetcode-152-maximum-product-subarray.mdx`:

1.  **Iframe:** Include the LeetCode problem link in an iframe.
2.  **Introduction:** 1-2 paragraphs with emojis (🚀, 🧩, 🔄).
3.  **The Problem:** Quote the problem description and provide an example.
4.  **Approach:** 
    - Heading: `## 🛠️ Approach: [Name]`
    - Explain the logic/intuition.
5.  **Visualization:**
    - Heading: `## 🔍 Visualizing the Approach (Dry Run)`
    - Use a Markdown table for the steps.
6.  **Code Block:** Use syntax highlighting for the language.
7.  **Complexity Analysis:**
    - Heading: `## ⏱️ Complexity Analysis`
    - Use a Markdown table for Time/Space complexity with a "Rating" column (e.g., 🏆 Optimal).
8.  **Pattern Recognition:**
    - Heading: `## 🧠 How to Recognize This Pattern`
    - List 2-3 similar problems or scenarios.
9.  **Interview Tips:**
    - Heading: `## 🎯 Interview Tips`
    - List 2-3 actionable tips for candidates.

## 📝 Example Prompt for the User
"Here is the LeetCode content. Follow the `LEETCODE_BLOG_GUIDE.md` to create the blog post."
