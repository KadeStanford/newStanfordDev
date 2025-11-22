const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://stanforddevsolutions.com";

const SEO = {
  title: "Stanford Development Solutions | Custom Web Development",
  description: "Innovative web solutions for modern businesses.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    site_name: "Stanford Development Solutions",
  },
  // sensible defaults for Next SEO usage
  additionalLinkTags: [
    {
      rel: "icon",
      href: `${siteUrl}/favicon.ico`,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Stanford Development Solutions",
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
};

module.exports = { SEO, siteUrl, organizationSchema };
