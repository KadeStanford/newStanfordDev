import { Html, Head, Main, NextScript } from "next/document";

const { organizationSchema } = require("../next-seo.config.js");

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Organization JSON-LD for improved SEO and knowledge graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
