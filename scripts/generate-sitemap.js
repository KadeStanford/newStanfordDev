const fs = require("fs");
const path = require("path");
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
