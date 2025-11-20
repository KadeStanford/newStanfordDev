import { useState, useEffect } from "react";

// Simple estimator component — keep client-side only and easy to extend
export default function Estimator({ projectType = "", onEstimateChange }) {
  const [features, setFeatures] = useState({
    cms: false,
    auth: false,
    payments: false,
    analytics: false,
    integrations: false,
    seo: false,
    content: false,
    speed: false,
  });
  const [complexity, setComplexity] = useState("medium");

  useEffect(() => {
    const estimate = calcEstimate(projectType, features, complexity);
    if (onEstimateChange) onEstimateChange(estimate.formatted);
  }, [projectType, features, complexity, onEstimateChange]);

  function toggle(name) {
    setFeatures((s) => ({ ...s, [name]: !s[name] }));
  }

  return (
    <div className="mt-6 bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-2">Quick Pricing Estimator</h3>
      <p className="text-sm text-slate-400 mb-3">
        Select features to get a quick, friendly estimate.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.cms}
            onChange={() => toggle("cms")}
          />
          CMS / Editor
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.auth}
            onChange={() => toggle("auth")}
          />
          Authentication
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.payments}
            onChange={() => toggle("payments")}
          />
          Payments / Checkout
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.analytics}
            onChange={() => toggle("analytics")}
          />
          Analytics
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.integrations}
            onChange={() => toggle("integrations")}
          />
          3rd‑party Integrations
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.seo}
            onChange={() => toggle("seo")}
          />
          SEO / Performance
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.content}
            onChange={() => toggle("content")}
          />
          Content / Copywriting
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.speed}
            onChange={() => toggle("speed")}
          />
          Speed Optimization
        </label>
      </div>

      <div className="mt-3">
        <label className="text-sm text-slate-400">Complexity</label>
        <select
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          className="w-full mt-1 bg-gray-700 text-white rounded-md py-2 px-3"
        >
          <option value="small">Small (short)</option>
          <option value="medium">Medium (typical)</option>
          <option value="large">Large / Complex</option>
        </select>
      </div>

      <EstimatorSummary
        projectType={projectType}
        features={features}
        complexity={complexity}
      />
    </div>
  );
}

function EstimatorSummary({ projectType, features, complexity }) {
  const estimate = calcEstimate(projectType, features, complexity);
  return (
    <div className="mt-4 border-t border-slate-700 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Estimated price</div>
        <div className="text-xl font-bold text-white">{estimate.formatted}</div>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        Typical range: {estimate.range}
      </div>
    </div>
  );
}

function calcEstimate(projectType, features, complexity) {
  // base prices by project type
  const baseMap = {
    "new-website": 6000,
    "website-redesign": 3500,
    ecommerce: 12000,
    seo: 1800,
    other: 3000,
    "": 4500,
  };

  let base = baseMap[projectType] ?? 4500;

  // feature add-ons
  const featureCosts = {
    cms: 2000,
    auth: 1500,
    payments: 3500,
    analytics: 500,
    integrations: 1200,
    seo: 800,
    content: 1200,
    speed: 900,
  };

  let extras = 0;
  for (const k of Object.keys(features || {})) {
    if (features[k]) extras += featureCosts[k] || 0;
  }

  const complexityMult =
    complexity === "small" ? 0.9 : complexity === "large" ? 1.4 : 1.0;

  const raw = Math.round((base + extras) * complexityMult);
  const low = Math.round(raw * 0.85);
  const high = Math.round(raw * 1.25);

  return {
    value: raw,
    formatted: `$${raw.toLocaleString()}`,
    range: `$${low.toLocaleString()} — $${high.toLocaleString()}`,
  };
}
