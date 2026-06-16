import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";

const postsDirectory = path.join(process.cwd(), "content", "posts");

function parseFrontmatterValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => parseFrontmatterValue(item))
      .filter((item) => item !== "");
  }

  return trimmed;
}

function parseFrontmatter(fileContents) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/m.exec(
    fileContents
  );

  if (!match) {
    return { data: {}, content: fileContents };
  }

  const data = {};
  const [, frontmatter, content] = match;

  frontmatter.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    if (!key) return;

    data[key] = parseFrontmatterValue(line.slice(separatorIndex + 1));
  });

  return { data, content };
}

export async function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((f) => /\.mdx?$/.test(f));
}

export async function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.mdx?$|\.md$/i, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = parseFrontmatter(fileContents);
  const mdxSource = await serialize(content, { scope: data });
  return { slug: realSlug, frontmatter: data, mdxSource };
}

export async function getAllPosts() {
  const slugs = await getPostSlugs();
  const posts = slugs.map((filename) => {
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = parseFrontmatter(fileContents);
    const slug = filename.replace(/\.mdx?$|\.md$/i, "");
    return { slug, ...data };
  });
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}
