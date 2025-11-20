import { Buffer } from "buffer";

export async function sendMail({ to, subject, text, html, from }) {
  const domain = process.env.MAILGUN_DOMAIN;
  const apiKey = process.env.MAILGUN_API_KEY;
  const fromAddr =
    from ||
    process.env.MAILGUN_FROM ||
    (domain ? `StanfordDev <no-reply@${domain}>` : undefined);

  if (!domain || !apiKey || !fromAddr) {
    throw new Error(
      "Mailgun not configured. Set MAILGUN_DOMAIN, MAILGUN_API_KEY and MAILGUN_FROM env vars."
    );
  }

  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  const params = new URLSearchParams();
  params.append("from", fromAddr);
  params.append("to", to);
  if (subject) params.append("subject", subject);
  if (text) params.append("text", text);
  if (html) params.append("html", html);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`api:${apiKey}`).toString("base64"),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const body = await resp.json().catch(() => null);
  if (!resp.ok) {
    const errMsg =
      body?.message || JSON.stringify(body) || `Mailgun error ${resp.status}`;
    const err = new Error(errMsg);
    // attach raw body for debugging
    err.raw = body;
    throw err;
  }

  return body;
}

export default sendMail;
