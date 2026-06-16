const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://stanforddevsolutions.com";

const SEO = {
  title:
    "Stanford Development Solutions | Websites & Ads for Local Businesses",
  description:
    "Custom websites, local SEO, lead tracking, and practical ad setup for local small businesses built personally by Kade Stanford.",
  canonical: siteUrl,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    site_name: "Stanford Development Solutions",
    title:
      "Stanford Development Solutions | Websites & Ads for Local Businesses",
    description:
      "Custom websites, local SEO, lead tracking, and practical ad setup for local small businesses built personally by Kade Stanford.",
    images: [
      {
        url: `${siteUrl}/images/kadeProfile.jpg`,
        width: 1200,
        height: 630,
        alt: "Kade Stanford, founder of Stanford Development Solutions",
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
      href: `${siteUrl}/favicon.ico`,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Stanford Development Solutions",
  url: siteUrl,
  logo: `${siteUrl}/images/StanfordDevLogo.png`,
  image: `${siteUrl}/images/kadeProfile.jpg`,
  founder: {
    "@type": "Person",
    name: "Kade Stanford",
    url: "https://www.linkedin.com/in/kadestanford",
  },
  areaServed: "United States",
  email: "stanforddevcontact@gmail.com",
  sameAs: [
    "https://github.com/KadeStanford",
    "https://www.linkedin.com/in/kadestanford",
  ],
  serviceType: [
    "Custom website design",
    "Local business SEO",
    "Facebook ads setup",
    "Google ads setup",
    "Lead tracking",
    "Website hosting and maintenance",
  ],
};

module.exports = { SEO, siteUrl, organizationSchema };
