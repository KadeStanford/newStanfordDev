import "../styles/globals.css"; // Ensure your global styles are imported
import { AuthContextProvider } from "../context/AuthContext";
import { Toaster } from "sonner";
import { DefaultSeo } from "next-seo";
import SEO from "../next-seo.config";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
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
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
      <Toaster position="bottom-right" theme="dark" richColors />
    </AuthContextProvider>
  );
}

export default MyApp;
