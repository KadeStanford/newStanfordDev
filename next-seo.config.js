const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.stanforddevsolutions.com"
).replace(/\/+$/, "");

const SEO = {
  title:
    "Stanford Development Solutions | Websites & Ads for Local Businesses",
  description:
    "Custom websites and Google and Meta ad management for local businesses, built and managed personally by Kade Stanford.",
  openGraph: {
    type: "website",
    locale: "en_US",
    site_name: "Stanford Development Solutions",
    title:
      "Stanford Development Solutions | Websites & Ads for Local Businesses",
    description:
      "Custom websites and Google and Meta ad management for local businesses, built and managed personally by Kade Stanford.",
    images: [
      {
        url: `${siteUrl}/images/sds-social-preview.png`,
        width: 1200,
        height: 630,
        alt: "Stanford Development Solutions — Websites built around your business, featuring Big Bass Tree Service and Liberty House Specialties",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
  // sensible defaults for Next SEO usage
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico?v=sds-1",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  ],
};

const founderId = `${siteUrl}/#kade-stanford`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": founderId,
      name: "Kade Stanford",
      url: siteUrl,
      image: `${siteUrl}/images/kadeProfile.jpg`,
      email: "mailto:stanforddevcontact@gmail.com",
      jobTitle: "Web Developer and Digital Marketer",
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Southeastern Louisiana University",
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Bachelor's degree",
        name: "Bachelor of Science in Information Technology",
        recognizedBy: {
          "@type": "CollegeOrUniversity",
          name: "Southeastern Louisiana University",
        },
      },
      sameAs: [
        "https://github.com/KadeStanford",
        "https://www.linkedin.com/in/kadestanford",
      ],
      knowsAbout: [
        "Custom website design and development",
        "Google Ads management",
        "Meta Ads management",
        "Local search optimization",
        "Lead tracking",
        "Website hosting and maintenance",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Stanford Development Solutions",
      url: siteUrl,
      publisher: { "@id": founderId },
      description:
        "Websites and advertising management for local businesses, operated independently by Kade Stanford.",
    },
  ],
};

module.exports = { SEO, siteUrl, structuredData };
