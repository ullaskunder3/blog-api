# Blog API Scripts – Quick Reference

This project automates the creation and management of your DSA blog posts.

---

## Scripts

- **Create new post**

```sh
pnpm new "Post Title" --tags="algorithms,python,dsa,interview"
```

Generates a new `.mdx` file in `data/posts/` and updates `posts.json` with metadata.

- **Show last post**

```sh
pnpm last
```

Displays metadata of the most recently created post.

- **Show post info by ID**

```sh
pnpm post --id 16
```

Shows metadata and file path for a post by its `id`.

---

## Tips

- **Slug** is automatically generated from the title.
- **Date** defaults to today if not provided. Use `--date=YYYY-MM-DD` to override.
- **Tags** are optional but recommended for categorization. Example: `--tags="python,dsa,arrays"`.
- **ID** increments automatically; do not edit manually.

> Recommended workflow:
>
> 1. Run `pnpm new ...` to create a post.
> 2. Edit the generated `.mdx` file with your content.
> 3. Use `pnpm last` to check the latest post if needed.
