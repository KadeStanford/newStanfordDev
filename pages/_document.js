import { Html, Head, Main, NextScript } from "next/document";

const { structuredData } = require("../next-seo.config.js");

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Public site and founder facts for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
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
