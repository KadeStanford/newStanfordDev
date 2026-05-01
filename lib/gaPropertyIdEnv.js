/**
 * GA4 Data API expects a numeric Property ID (Admin → Property settings).
 * Measurement IDs look like G-XXXXXXXX — those must NOT be used here.
 */
function resolveGa4NumericPropertyId(raw) {
  const s = String(raw ?? "").trim();
  if (!s) {
    return { propertyId: null, hint: null };
  }
  if (/^G-[A-Z0-9]+$/i.test(s)) {
    return {
      propertyId: null,
      hint:
        "SITE_GA4_PROPERTY_ID / NEXT_PUBLIC_SITE_GA4_PROPERTY_ID is set to a Measurement ID (G-…). Replace it with the numeric Property ID from Google Analytics → Admin → Property settings (digits only, not G-…).",
    };
  }
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 8) {
    return { propertyId: digits, hint: null };
  }
  if (digits.length > 0) {
    return {
      propertyId: null,
      hint:
        "GA4 Property ID looks incomplete. Use the full numeric Property ID from GA Admin → Property settings.",
    };
  }
  return {
    propertyId: null,
    hint:
      "Set SITE_GA4_PROPERTY_ID to your GA4 numeric Property ID (digits only).",
  };
}

module.exports = { resolveGa4NumericPropertyId };
