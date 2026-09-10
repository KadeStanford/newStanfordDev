import { getPostBySlug, getPostSlugs } from "../../lib/posts";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Head from "next/head";
import { siteUrl } from "../../next-seo.config";

export async function getStaticPaths() {
  const slugs = await getPostSlugs();
  return {
    paths: slugs.map((s) => ({ params: { slug: s.replace(/\.mdx?$/, "") } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  return { props: { post } };
}

export default function PostPage({ post }) {
  if (!post) return <div>Post not found</div>;
  const { frontmatter, mdxSource } = post;
  const components = { Image };
  return (
    <article className="max-w-4xl mx-auto py-20 px-6">
      <Head>
        <title>{frontmatter.title} | Stanford Development Solutions</title>
        <meta name="description" content={frontmatter.description || ""} />
        <link rel="canonical" href={`${siteUrl}/blog/${post.slug}`} />
        <meta property="og:url" content={`${siteUrl}/blog/${post.slug}`} />
      </Head>
      <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <p className="text-sm text-slate-400 mb-6">{frontmatter.date}</p>
      <div className="prose prose-invert">
        <MDXRemote {...mdxSource} components={components} />
      </div>
    </article>
  );
}
