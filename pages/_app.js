import "../styles/globals.css"; // Ensure your global styles are imported
import { AuthContextProvider } from "../context/AuthContext";
import { Toaster } from "sonner";
import { DefaultSeo } from "next-seo";
import siteSeoConfig from "../next-seo.config";
import { useEffect } from "react";
import Script from "next/script"; // Import Script component

function MyApp({ Component, pageProps }) {
  // Use environment variable for GA ID
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Client-only PostHog init (optional). Requires NEXT_PUBLIC_POSTHOG_KEY.
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key && typeof window !== "undefined") {
      try {
        const posthog = require("posthog-js");
        posthog.init(key, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        });
        // example: identify anonymous user if you have an id
        // posthog.identify('user-id')
      } catch (e) {
        // ignore in SSR or if posthog missing
      }
    }
  }, []);

  return (
    <AuthContextProvider>
      {/* Google Analytics Setup using next/script */}
      {GA_MEASUREMENT_ID && (
        <>
          {/* 1. Loads the gtag.js script asynchronously */}
          <Script
            strategy="afterInteractive" // Loads after hydration
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />

          {/* 2. Initializes the dataLayer and runs the config command */}
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* support CommonJS export (object with SEO) and plain default */}
      <DefaultSeo
        {...(siteSeoConfig && siteSeoConfig.SEO
          ? siteSeoConfig.SEO
          : siteSeoConfig)}
      />
      <Component {...pageProps} />
      <Toaster position="bottom-right" theme="dark" richColors />
    </AuthContextProvider>
  );
}

export default MyApp;
