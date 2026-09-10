import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  projectType: "website",
  message: "",
};

const isLocalDevelopment = () => process.env.NODE_ENV === "development";

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const formRef = useRef(null);
  const recaptchaContainerRef = useRef(null);
  const recaptchaWidgetRef = useRef(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const captchaRequired = Boolean(siteKey) && !isLocalDevelopment();

  useEffect(() => {
    const focusForm = () => {
      setSubmitted(false);
      setTimeout(() => formRef.current?.querySelector("input")?.focus(), 500);
    };

    window.addEventListener("openEstimateForm", focusForm);
    return () => window.removeEventListener("openEstimateForm", focusForm);
  }, []);

  useEffect(() => {
    if (!captchaRequired || !recaptchaContainerRef.current) return undefined;

    let cancelled = false;

    const renderCaptcha = () => {
      if (
        cancelled ||
        recaptchaWidgetRef.current !== null ||
        !window.grecaptcha?.render ||
        !recaptchaContainerRef.current
      ) {
        return;
      }

      recaptchaWidgetRef.current = window.grecaptcha.render(
        recaptchaContainerRef.current,
        {
          sitekey: siteKey,
          callback: () => setRecaptchaReady(true),
          "expired-callback": () => setRecaptchaReady(false),
          "error-callback": () => setRecaptchaReady(false),
        }
      );
    };

    if (window.grecaptcha?.render) {
      renderCaptcha();
    } else {
      const existing = document.querySelector(
        'script[src*="google.com/recaptcha/api.js"]'
      );
      if (existing) {
        existing.addEventListener("load", renderCaptcha, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderCaptcha, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [captchaRequired, siteKey]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Please enter your name.";
    if (!form.email.trim() && !form.phone.trim()) {
      nextErrors.email = "Enter an email address or phone number.";
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) {
      nextErrors.message = "Tell me briefly what you are hoping to improve.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    let recaptchaToken;
    if (captchaRequired) {
      recaptchaToken = window.grecaptcha?.getResponse(
        recaptchaWidgetRef.current
      );
      if (!recaptchaToken) {
        toast.error("Please complete the CAPTCHA before sending.");
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending your request...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          ...form,
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          website: form.website.trim() || undefined,
          message: form.message.trim() || undefined,
          recaptchaToken,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to send your request.");
      }

      setForm(initialForm);
      setSubmitted(true);
      toast.success("Request sent. I will be in touch soon.", { id: toastId });
      if (captchaRequired && recaptchaWidgetRef.current !== null) {
        window.grecaptcha?.reset(recaptchaWidgetRef.current);
        setRecaptchaReady(false);
      }

      if (typeof window.gtag === "function") {
        window.gtag("event", "form_submission", {
          form_type: "free_audit",
          project_type: form.projectType,
          event_category: "lead_generation",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("I could not send that request. Please try again or email me.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15";

  return (
    <section id="contact" className="relative z-10 overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 to-blue-950/30" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            Get in touch
          </p>
          <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">
            How can I help?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            You do not need a finished brief or a technical plan. Tell me what you want to improve, what is not working, or what you wish were easier. I will reply within 24 hours on weekdays with a useful next step.
          </p>

          <div className="mt-8 space-y-4 text-slate-300">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-blue-400" size={20} />
              <p>No obligation</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-blue-400" size={20} />
              <p>No automated sales sequence</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-blue-400" size={20} />
              <p>Paid work is scoped and priced in writing first</p>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 text-sm text-slate-400">
            <a
              href="mailto:stanforddevcontact@gmail.com"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Mail size={17} aria-hidden="true" />
              stanforddevcontact@gmail.com
            </a>
            <p className="inline-flex items-center gap-2">
              <Phone size={17} aria-hidden="true" />
              Choose phone below if that is easier
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur md:p-9">
          {submitted ? (
            <div className="flex min-h-[32rem] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                <CheckCircle2 size={34} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">
                Your message is in.
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-slate-400">
                Thanks for telling me about your project. I will review what you shared and reply within 24 hours on weekdays.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-7 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                Send another request
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
                  Your name
                  <span className="ml-2 text-xs font-medium text-blue-300">
                    Required
                  </span>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    className={fieldClass}
                    autoComplete="name"
                    required
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && (
                    <span className="mt-2 block text-sm text-red-300">
                      {errors.fullName}
                    </span>
                  )}
                </label>

                <fieldset className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
                  <legend className="mb-1 text-sm font-semibold text-slate-200">
                    How should I contact you?
                    <span className="ml-2 text-xs font-medium text-blue-300">
                      At least one required
                    </span>
                  </legend>
                  <label className="text-sm font-semibold text-slate-200">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      className={fieldClass}
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && (
                      <span className="mt-2 block text-sm text-red-300">
                        {errors.email}
                      </span>
                    )}
                  </label>

                  <label className="text-sm font-semibold text-slate-200">
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={updateField}
                      className={fieldClass}
                      autoComplete="tel"
                      placeholder="(225) 555-0123"
                    />
                  </label>
                </fieldset>

                <label className="text-sm font-semibold text-slate-200">
                  Business name
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                  <input
                    name="company"
                    value={form.company}
                    onChange={updateField}
                    className={fieldClass}
                    autoComplete="organization"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-200">
                  Current website
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={updateField}
                    className={fieldClass}
                    placeholder="https://"
                    autoComplete="url"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
                  What would you like help with?
                  <span className="ml-2 text-xs font-medium text-blue-300">
                    Required
                  </span>
                  <select
                    name="projectType"
                    value={form.projectType}
                    onChange={updateField}
                    className={fieldClass}
                    required
                  >
                    <option value="website">A new or redesigned website</option>
                    <option value="business-tool">A custom business tool or portal</option>
                    <option value="google-ads">Google Ads</option>
                    <option value="meta-ads">Facebook or Instagram Ads</option>
                    <option value="website-and-ads">Website and advertising</option>
                    <option value="care">Website care or improvements</option>
                    <option value="other">Something else</option>
                    <option value="unsure">I am not sure yet</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
                  What are you hoping to improve?
                  <span className="ml-2 text-xs font-medium text-blue-300">
                    Required
                  </span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    className={`${fieldClass} min-h-32 resize-y`}
                    placeholder="A sentence or two is enough. You can describe the problem even if you do not know the solution."
                    required
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && (
                    <span className="mt-2 block text-sm text-red-300">
                      {errors.message}
                    </span>
                  )}
                </label>
              </div>

              {captchaRequired && (
                <div className="mt-6">
                  <div ref={recaptchaContainerRef} />
                  {!recaptchaReady && (
                    <p className="mt-2 text-sm text-slate-500">
                      Complete the CAPTCHA before sending.
                    </p>
                  )}
                </div>
              )}

              {isLocalDevelopment() && (
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
                  <ShieldCheck size={17} aria-hidden="true" />
                  CAPTCHA is disabled for this local preview.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || (captchaRequired && !recaptchaReady)}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send message"}
                {!submitting && <ArrowRight size={18} aria-hidden="true" />}
              </button>
              <p className="mt-4 text-center text-sm text-slate-500">
                I use your information only to respond to this request.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
