// Amplify's build environment is not automatically the SSR runtime environment.
// Persist only explicitly allowed server settings. Never log their values.
// .env.production belongs to the private build artifact, never to Git/public/.
const fs = require('node:fs');
const names = [
  'CONTACT_RATE_LIMIT', 'CONTACT_RECEIVER', 'MAILGUN_API_KEY', 'MAILGUN_DOMAIN',
  'MAILGUN_FROM', 'MAILGUN_BASE_URL', 'RECAPTCHA_SECRET', 'RATE_LIMIT_SALT',
  'FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT', 'GOOGLE_CREDENTIALS_BASE64',
  'GA_SA_KEY_BASE64', 'GA_SA_KEY', 'SITE_GA4_PROPERTY_ID', 'GA_API_SECRET',
  ...Object.keys(process.env).filter(name => name.startsWith('NEXT_PUBLIC_')),
];
for (const name of ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'RECAPTCHA_SECRET', 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY']) {
  if (!process.env[name]) throw new Error(`Missing required production setting: ${name}`);
}
const lines = [...new Set(names)].filter(name => process.env[name]).map(name => {
  const value = process.env[name];
  if (value.includes('\r') || value.includes('\n') || value.includes('"')) {
    throw new Error(`Use a single-line/base64 value for production setting: ${name}`);
  }
  return `${name}="${value.replace(/\$/g, '\\$')}"`;
});
fs.writeFileSync('.env.production', `${lines.join('\n')}\n`, { mode: 0o600 });
console.log(`Prepared ${lines.length} runtime settings (values hidden).`);
