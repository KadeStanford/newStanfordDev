import { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

function Stars({ value = 5 }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <div className="flex items-center" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < v ? "currentColor" : "none"}
          stroke="currentColor"
          className={`w-4 h-4 ${
            i < v ? "text-amber-400" : "text-amber-400/30"
          } mr-1`}
        >
          <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4 1 5.8L10 15.8 4.8 17.4l1-5.8L1.6 7.6l5.8-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsDisplay({ limit = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel state/hooks declared unconditionally to preserve hook order
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Fetch featured testimonials only (avoid composite index issues)
        const q = query(
          collection(db, "testimonials"),
          where("featured", "==", true)
        );
        const snap = await getDocs(q);
        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // sort by displayOrder (missing => 0)
        list.sort(
          (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
        );
        if (mounted) setItems(list.slice(0, limit));
      } catch (e) {
        console.error("Failed to load testimonials", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [limit]);

  // Auto-advance carousel when there are multiple items
  useEffect(() => {
    if (items.length <= 1) return undefined;
    // ensure index in range
    setIndex((i) => (i >= items.length ? 0 : i));
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [items.length]);

  const prev = () => {
    clearInterval(intervalRef.current);
    setIndex((i) => (i - 1 + items.length) % items.length);
  };
  const next = () => {
    clearInterval(intervalRef.current);
    setIndex((i) => (i + 1) % items.length);
  };

  const hasMultiple = items.length > 1;

  if (loading) return null;
  if (!items.length) return null;

  return (
    <section className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="p-2 bg-slate-900/60 rounded-md border border-slate-800">
            <MessageSquare className="text-blue-400" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              What our clients say
            </h2>
            <p className="text-slate-400 mt-1">
              Approved & featured testimonials from real clients.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-4 h-1 w-36 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-center">
          {items.map((t, i) => (
            <figure
              key={t.id}
              className={`max-w-3xl mx-auto p-8 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-md transition-all duration-500 ${
                i === index
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-95 pointer-events-none absolute left-1/2 -translate-x-1/2"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="text-slate-300 text-lg md:text-xl italic leading-relaxed">
                    “{t.message}”
                  </div>
                  <div className="mt-4 text-xs text-slate-400 uppercase tracking-wider">
                    {t.company}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <Stars value={t.rating ?? t.stars ?? 5} />
                  <figcaption className="mt-3 text-sm font-semibold text-white">
                    {t.name}
                  </figcaption>
                </div>
              </div>
            </figure>
          ))}
        </div>

        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="absolute top-1/2 -translate-y-1/2 hidden md:flex md:left-4 p-3 bg-slate-800/70 text-slate-200 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="absolute top-1/2 -translate-y-1/2 hidden md:flex md:right-4 p-3 bg-slate-800/70 text-slate-200 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-3 mt-6">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    clearInterval(intervalRef.current);
                    setIndex(i);
                  }}
                  className={`w-3 h-3 rounded-full ${
                    i === index ? "bg-amber-400" : "bg-slate-700"
                  } border border-slate-700`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
