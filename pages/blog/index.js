import Link from "next/link";
import { getAllPosts } from "../../lib/posts";

export async function getStaticProps() {
  const posts = await getAllPosts();
  return { props: { posts } };
}

export default function BlogIndex({ posts }) {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-8">Blog & Case Studies</h1>
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
