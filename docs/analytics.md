# Analytics Integration

This document explains two analytics approaches you can use after a project is marked "Completed":

1. Google Analytics (recommended for production-grade analytics)
2. Lightweight custom analytics (built-in) using `POST /api/track` and Firestore storage

## Environment variables (`.env.local`)

Add these to your project's `.env.local` (do not commit to git):

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — your Google Analytics 4 measurement ID (G-XXXXXXX). Used in front-end scripts.
- `GA_API_SECRET` — (optional) Measurement Protocol API secret for server-side hits if you want to forward events.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — (optional) JSON string of a Google service account key if you want server-side access to the Google Analytics Data API.

Example `.env.local` (do NOT commit):

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_measurement_protocol_secret_here
# If you plan to use the Google Analytics Data API to pull reports server-side,
# you can paste the JSON credentials as a single-line string (or load from secret manager).
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}
```

## Option A — Google Analytics (GA4)

1. Create a Google Analytics account and a GA4 property for the website you deploy:

   - Go to https://analytics.google.com/ and create an account + property.
   - Create a Web data stream and note the Measurement ID (looks like `G-XXXXXXX`).

2. Add the standard GA snippet to the deployed site templates (recommended):

```html
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  +gtag("js", new Date());
  +gtag("config", "G-XXXXXXX");
</script>
```

- Replace `G-XXXXXXX` with `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` at build time.
- In a Next.js app you can include this in `pages/_document.js` or a small client-side component that runs in production builds only.

3. (Optional) Server-side measurement protocol

- To forward events server-side (e.g., from `/api/track`) to GA4, you can use the Measurement Protocol endpoint:

  POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXX&api_secret=YOUR_API_SECRET

  Body example (JSON):

  ```json
  {
    "client_id": "555",
    "events": [{ "name": "page_view", "params": { "page_path": "/" } }]
  }
  ```

- You need a Measurement Protocol `API secret` per property (create in GA Admin > Data Streams > Measurement Protocol API secrets).
- Set `GA_API_SECRET` in `.env.local` and ensure your server-side code reads it.

4. Viewing data

- GA4 provides the web UI dashboards and reporting APIs. If you want to embed GA reports inside this app, you would need to implement OAuth/service-account access and call the Google Analytics Data API (beyond the MVP). For quick access, the Admin UI can include a link to the GA property and the GA real-time report.

## Option B — Built-in lightweight analytics (MVP)

This project includes a simple `/api/track` endpoint that will store raw events under "analytics/{projectId}/events" in Firestore. A small dashboard in the Client Dashboard will show a 7-day sparkline and totals.

Usage (client-side snippet to include on the live site):

```html
<script>
  (function () {
    function sendTrack(path) {
      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: "PROJECT_ID",
            path: path || location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {});
      } catch (e) {}
    }
    // send initial page view
    sendTrack();
    // send on SPA navigation if applicable
    window.addEventListener("popstate", () => sendTrack(location.pathname));
  })();
</script>
```

Replace `PROJECT_ID` with the project document id (may be injected server-side when you deploy the site for the client).

Notes & limits

- The built-in tracker is intentionally lightweight and not meant to replace GA for large sites.
- Storing lots of raw events in Firestore can incur costs. Consider batching/aggregating events or forwarding to an analytics backend for large traffic.

## Recommendation

- For production sites with expected traffic, integrate GA4 for reliable dashboards and continued support.
- Use the built-in `/api/track` for small clients, demos, or to provide a privacy-friendly minimal dashboard.

If you want, I can next:

- Add an admin settings UI to configure a project's `gaMeasurementId` and to toggle `analyticsEnabled`.
- Implement server-side forwarding from `/api/track` to the GA Measurement Protocol when `GA_API_SECRET` is configured.
- Build an admin analytics page that can pull GA data via the GA Data API using a service account.
