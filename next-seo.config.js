const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const SEO = {
  title: "Stanford Development Solutions | Custom Web Development",
  description: "Innovative web solutions for modern businesses.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    site_name: "Stanford Development Solutions",
  },
  twitter: {
    handle: "@yourhandle",
    site: "@yourhandle",
    cardType: "summary_large_image",
  },
};

module.exports = SEO;
