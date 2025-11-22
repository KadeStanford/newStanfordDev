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
        {/* Preconnect to Google font resources and load fonts with font-display=swap */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
