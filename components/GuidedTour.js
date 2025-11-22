import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const steps = [
  {
    element: "#hero",
    popover: {
      title: "Hero Section",
      description:
        "This is where your users land first. We highlight your main value proposition here.",
    },
  },
  {
    element: "#about",
    popover: {
      title: "About Me",
      description:
        "A brief introduction to who you are and what drives your work.",
    },
  },
  {
    element: "#services",
    popover: {
      title: "Services",
      description:
        "Detailed breakdown of the specific services and packages you offer.",
    },
  },
  {
    element: "#work",
    popover: {
      title: "Featured Work",
      description: "Showcase your best case studies and past projects here.",
    },
  },
  {
    element: "#contact",
    popover: {
      title: "Get in Touch",
      description:
        "The final call to action for users to start a project with you.",
    },
  },
];

export default function GuidedTour() {
  const driverObj = useRef(null);

  useEffect(() => {
    driverObj.current = driver({
      // 1. ENABLE JS ANIMATION
      animate: true,

      // 2. UI POLISH
      opacity: 0.75, // Darker overlay for better focus
      stagePadding: 8, // Space between the highlight and your element
      popoverOffset: 20, // Space between the highlight and the popup
      showProgress: true, // Shows "1 of 5"

      // 3. ASSIGN CLASS FOR STYLING
      popoverClass: "driverjs-dark-theme",

      // 4. THE SCROLL FIX
      // We must force the browser to stop "helping" with scroll-behavior: smooth
      // so the library can calculate the smooth animation path itself.
      onHighlightStarted: () => {
        document.documentElement.style.cssText =
          "scroll-behavior: auto !important;";
        document.body.style.cssText = "scroll-behavior: auto !important;";
      },
      onDestroyed: () => {
        // Reset to default when tour ends
        document.documentElement.style.cssText = "";
        document.body.style.cssText = "";
      },

      steps: steps,
    });
  }, []);

  return (
    <>
      <style>{`
        /* --- THEME OVERRIDES --- */
        
        /* The Main Card */
        .driverjs-dark-theme .driver-popover {
          background-color: #0f172a; /* slate-900 */
          color: #f8fafc;            /* slate-50 */
          border: 1px solid #334155; /* slate-700 */
          border-radius: 12px;
          padding: 24px;
          min-width: 300px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 20px 25px -5px rgba(0, 0, 0, 0.4); /* Deep shadow */
        }

        /* Title */
        .driverjs-dark-theme .driver-popover-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        /* Description */
        .driverjs-dark-theme .driver-popover-description {
          font-size: 0.95rem;
          color: #94a3b8; /* slate-400 */
          line-height: 1.6;
          margin-bottom: 24px;
        }

        /* Progress Counter (1 of 5) */
        .driverjs-dark-theme .driver-popover-progress-text {
          color: #475569; /* slate-600 */
          font-size: 0.75rem;
        }

        /* Navigation Buttons Container */
        .driverjs-dark-theme .driver-popover-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }

        /* General Buttons */
        .driverjs-dark-theme .driver-popover-footer button {
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid transparent;
          outline: none;
          text-shadow: none;
        }

        /* 'Previous' Button */
        .driverjs-dark-theme .driver-popover-footer button.driver-popover-prev-btn {
          background-color: transparent;
          border-color: #334155; /* slate-700 */
          color: #cbd5e1;        /* slate-300 */
        }
        .driverjs-dark-theme .driver-popover-footer button.driver-popover-prev-btn:hover {
          background-color: #1e293b; /* slate-800 */
          color: white;
        }

        /* 'Next' / 'Done' Button */
        .driverjs-dark-theme .driver-popover-footer button.driver-popover-next-btn {
          background-color: #2563eb; /* blue-600 */
          color: white;
          margin-left: auto; /* Push to right */
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }
        .driverjs-dark-theme .driver-popover-footer button.driver-popover-next-btn:hover {
          background-color: #1d4ed8; /* blue-700 */
          transform: translateY(-1px);
        }

        /* Arrow styling (Triangle pointing to element) */
        .driverjs-dark-theme .driver-popover-arrow-side-left.driver-popover-arrow { border-left-color: #334155; }
        .driverjs-dark-theme .driver-popover-arrow-side-left.driver-popover-arrow::after { border-left-color: #0f172a; }

        .driverjs-dark-theme .driver-popover-arrow-side-right.driver-popover-arrow { border-right-color: #334155; }
        .driverjs-dark-theme .driver-popover-arrow-side-right.driver-popover-arrow::after { border-right-color: #0f172a; }

        .driverjs-dark-theme .driver-popover-arrow-side-top.driver-popover-arrow { border-top-color: #334155; }
        .driverjs-dark-theme .driver-popover-arrow-side-top.driver-popover-arrow::after { border-top-color: #0f172a; }

        .driverjs-dark-theme .driver-popover-arrow-side-bottom.driver-popover-arrow { border-bottom-color: #334155; }
        .driverjs-dark-theme .driver-popover-arrow-side-bottom.driver-popover-arrow::after { border-bottom-color: #0f172a; }
        
        /* Hide default Close X button (cleaner UI) */
        .driverjs-dark-theme .driver-popover-close-btn {
           color: #475569;
        }
        .driverjs-dark-theme .driver-popover-close-btn:hover {
           color: #fff;
        }
      `}</style>

      <button
        onClick={() => driverObj.current.drive()}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-medium"
      >
        <span>Start Tour</span>
      </button>
    </>
  );
}
