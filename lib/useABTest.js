import { useEffect, useState } from "react";

export default function useABTest(key, variants = ["A", "B"]) {
  const [variant, setVariant] = useState(null);
  const _variantsKey = JSON.stringify(variants);

  useEffect(() => {
    // If PostHog is available, try to get experiment assignment
    const assign = async () => {
      try {
        if (typeof window !== "undefined" && window.posthog) {
          // Use PostHog feature flag/experiments if configured
          const ph = window.posthog;
          // example of using feature flags
          const flagName = `experiment_${key}`;
          const flag = ph.get_feature_flag(flagName);
          let variantsList;
          try {
            variantsList = JSON.parse(_variantsKey) || [];
          } catch (e) {
            variantsList = [];
          }

          if (flag && variantsList.includes(flag)) {
            setVariant(flag);
            return;
          }
          // fallback: use capture to let PostHog record exposure
          const chosen = localStorage.getItem(`ab_${key}`);
          if (chosen) {
            setVariant(chosen);
            ph.capture("ab_assign_existing", {
              experiment: key,
              variant: chosen,
            });
            return;
          }
          const rand =
            variantsList[Math.floor(Math.random() * variantsList.length)];
          localStorage.setItem(`ab_${key}`, rand);
          setVariant(rand);
          ph.capture("ab_assign", { experiment: key, variant: rand });
          return;
        }
      } catch (e) {
        // ignore
      }

      // No PostHog: local random assignment persisted to localStorage
      const existing = localStorage.getItem(`ab_${key}`);
      if (existing) {
        setVariant(existing);
      } else {
        let variantsListLocal;
        try {
          variantsListLocal = JSON.parse(_variantsKey) || [];
        } catch (e) {
          variantsListLocal = [];
        }
        const rand =
          variantsListLocal[
            Math.floor(Math.random() * variantsListLocal.length)
          ];
        localStorage.setItem(`ab_${key}`, rand);
        setVariant(rand);
      }
    };

    assign();
  }, [key, _variantsKey]);

  return variant;
}
