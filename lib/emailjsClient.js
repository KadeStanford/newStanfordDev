const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const LEAD_RECEIVER = "stanforddevcontact@gmail.com";

const DEFAULT_EMAILJS_CONFIG = {
  publicKey: "Ivts-AaJVTUhc3stA",
  serviceId: "service_hdtzdh6",
  templateId: "template_qq42jrx",
  projectTemplateId: "template_jc5j8if",
  confirmationTemplateId: "template_6lsdhsn",
};

function getEmailJsConfig() {
  return {
    publicKey:
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
      DEFAULT_EMAILJS_CONFIG.publicKey,
    serviceId:
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
      DEFAULT_EMAILJS_CONFIG.serviceId,
    templateId:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      DEFAULT_EMAILJS_CONFIG.templateId,
    projectTemplateId:
      process.env.NEXT_PUBLIC_EMAILJS_PROJECT_TEMPLATE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      DEFAULT_EMAILJS_CONFIG.projectTemplateId,
    confirmationTemplateId:
      process.env.NEXT_PUBLIC_EMAILJS_CONFIRMATION_TEMPLATE_ID ||
      DEFAULT_EMAILJS_CONFIG.confirmationTemplateId,
  };
}

export function isEmailJsConfigured() {
  const config = getEmailJsConfig();
  return Boolean(
    config.serviceId && config.templateId && config.publicKey
  );
}

function formatReadiness(payload) {
  return (
    [
      payload.hasBranding && "Logo / branding",
      payload.hasContent && "Text content",
      payload.hasImages && "Images / photos",
      payload.needsCMS && "Needs CMS",
      payload.hasDomain && "Domain purchased",
      payload.hasHosting && "Hosting purchased",
    ]
      .filter(Boolean)
      .join(", ") || "Not specified"
  );
}

function formatProjectType(value) {
  const labels = {
    website: "Website",
    ecommerce: "Online Store",
    redesign: "Website Redesign",
    seo: "SEO / Local Visibility",
    ads: "Ads Setup",
    other: "Other",
  };

  return labels[value] || value || "Not specified";
}

function formatMessage(payload = {}) {
  const isProject = payload.type === "project";
  const message = payload.message || payload.notes || "";

  if (!isProject) {
    return message || "No message provided.";
  }

  return [
    "Free local audit request",
    "",
    `Message / notes: ${message || "Not provided"}`,
    `Company: ${payload.company || "Not specified"}`,
    `Current website: ${payload.website || "Not specified"}`,
    `Project type: ${formatProjectType(payload.projectType)}`,
    `Budget: ${payload.formattedBudget || payload.budget || "Not specified"}`,
    `Timeline: ${payload.timeline || "Not specified"}`,
    `Estimated pages: ${payload.pages || "Not specified"}`,
    `Preferred contact: ${payload.preferredContact || "Not specified"}`,
    `Inspiration links: ${payload.inspirationLinks || "None provided"}`,
    `Competitors: ${payload.competitorLinks || "None provided"}`,
    `Inspiration notes: ${payload.inspirationNotes || "None provided"}`,
    `Ready now: ${formatReadiness(payload)}`,
    `Preferred colors: ${
      Array.isArray(payload.colorPalette) && payload.colorPalette.length
        ? payload.colorPalette.join(", ")
        : "Not specified"
    }`,
  ].join("\n");
}

export function buildEmailJsParams(payload = {}) {
  const isProject = payload.type === "project";
  const service = isProject
    ? `Free Local Audit - ${formatProjectType(payload.projectType)}`
    : "General Question";

  return {
    to_email: LEAD_RECEIVER,
    reply_to: payload.email || "",
    from_name: payload.fullName || payload.name || "Website visitor",
    from_email: payload.email || "",
    from_phone: payload.phone || "",
    service,
    message: formatMessage(payload),
    phone: payload.phone || "",
    company: payload.company || "",
    current_website: payload.website || "",
    submission_type: isProject ? "Free estimate request" : "General message",
    project_type: formatProjectType(payload.projectType),
    budget: payload.formattedBudget || payload.budget || "",
    timeline: payload.timeline || "",
    pages: payload.pages || "",
    preferred_contact: payload.preferredContact || "",
    inspiration_links: payload.inspirationLinks || "",
    competitor_links: payload.competitorLinks || "",
    inspiration_notes: payload.inspirationNotes || "",
    readiness: isProject ? formatReadiness(payload) : "",
    color_palette: Array.isArray(payload.colorPalette)
      ? payload.colorPalette.join(", ")
      : "",
    "g-recaptcha-response": payload.recaptchaToken || "",
  };
}

export async function sendLeadEmail(payload) {
  if (!isEmailJsConfigured()) {
    throw new Error("EmailJS is not configured.");
  }

  const config = getEmailJsConfig();
  const templateId =
    payload?.type === "project" ? config.projectTemplateId : config.templateId;
  const templateParams = buildEmailJsParams(payload);

  const result = await sendEmailJsTemplate({
    serviceId: config.serviceId,
    templateId,
    publicKey: config.publicKey,
    templateParams,
  });

  if (payload?.email && config.confirmationTemplateId) {
    sendEmailJsTemplate({
      serviceId: config.serviceId,
      templateId: config.confirmationTemplateId,
      publicKey: config.publicKey,
      templateParams,
    }).catch((error) => {
      console.warn("Confirmation email failed:", error);
    });
  }

  return result;
}

async function sendEmailJsTemplate({
  serviceId,
  templateId,
  publicKey,
  templateParams,
}) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `EmailJS failed with ${response.status}`);
  }

  return response.text();
}
