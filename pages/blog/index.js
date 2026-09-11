import Link from "next/link";
import Head from "next/head";
import { getAllPosts } from "../../lib/posts";
import { siteUrl } from "../../next-seo.config";

export async function getStaticProps() {
  const posts = await getAllPosts();
  return { props: { posts } };
}

export default function BlogIndex({ posts }) {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Head>
        <title>Blog & Case Studies | Stanford Development Solutions</title>
        <meta
          name="description"
          content="Practical website, SEO, and local marketing insights from Stanford Development Solutions."
        />
        <link rel="canonical" href={`${siteUrl}/blog`} />
        {posts.length === 0 && <meta name="robots" content="noindex, follow" />}
      </Head>
      <h1 className="text-4xl font-bold mb-8">Blog & Case Studies</h1>
      {posts.length === 0 && (
        <p className="text-slate-400">
          New case studies are in progress. In the meantime, learn about our{" "}
          <Link href="/#pricing" className="text-blue-400 hover:text-blue-300">
            website and marketing services
          </Link>
          .
        </p>
      )}
      <ul className="space-y-6">
        {posts.map((p) => (
          <li key={p.slug} className="border-l-2 pl-4">
            <Link
              href={`/blog/${p.slug}`}
              className="text-2xl font-semibold text-blue-400"
            >
              {p.title}
            </Link>
            <p className="text-sm text-slate-400">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
