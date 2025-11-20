const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { serialize } = require("next-mdx-remote/serialize");

const postsDirectory = path.join(process.cwd(), "content", "posts");

async function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((f) => /\.mdx?$/.test(f));
}

async function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.mdx?$|\.md$/i, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const mdxSource = await serialize(content, { scope: data });
  return { slug: realSlug, frontmatter: data, mdxSource };
}

async function getAllPosts() {
  const slugs = await getPostSlugs();
  const posts = slugs.map((filename) => {
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    const slug = filename.replace(/\.mdx?$|\.md$/i, "");
    return { slug, ...data };
  });
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = { getPostSlugs, getPostBySlug, getAllPosts };
