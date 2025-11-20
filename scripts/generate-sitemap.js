const fs = require("fs");
const path = require("path");
// Load environment variables from .env.local when running the script directly
try {
  require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });
} catch (e) {
  // ignore if dotenv is not available
}
// If dotenv wasn't installed or didn't populate the value, try a simple .env.local parse
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^\s*NEXT_PUBLIC_SITE_URL\s*=\s*(.+)\s*$/m);
      if (match && match[1]) {
        let v = match[1].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        process.env.NEXT_PUBLIC_SITE_URL = v;
      }
    }
  } catch (e) {
    // ignore parse errors
  }
}
const fg = require("fast-glob");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const outDir = path.join(process.cwd(), "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function getPages() {
  // pages folder (exclude api and _* files)
  const pages = await fg(
    ["pages/**/*.js", "pages/**/*.jsx", "pages/**/*.ts", "pages/**/*.tsx"],
    {
      ignore: [
        "pages/_*.js",
        "pages/_*.tsx",
        "pages/api/**",
        "pages/**/[*].*",
        "pages/**/admin/**",
      ],
    }
  );

  return pages
    .map((p) => p.replace("pages", ""))
    .map((p) => p.replace(/\.js$|\.jsx$|\.tsx$|\.ts$/i, ""))
    .map((p) => (p === "/index" ? "/" : p));
}

async function getPosts() {
  // content/posts folder - mdx files
  const posts = await fg(["content/posts/**/*.mdx", "content/posts/**/*.md"], {
    dot: false,
  });
  return posts.map((p) => {
    const slug = path.basename(p).replace(/\.mdx?$|\.md$/i, "");
    return `/blog/${slug}`;
  });
}

async function generate() {
  const pages = await getPages();
  const posts = await getPosts();

  const urls = [...pages, ...posts];

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((url) => `  <url>\n    <loc>${siteUrl}${url}</loc>\n  </url>`)
      .join("\n") +
    `\n</urlset>`;

  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
  console.log("sitemap.xml written with", urls.length, "entries");

  const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
  fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
  console.log("robots.txt written");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
