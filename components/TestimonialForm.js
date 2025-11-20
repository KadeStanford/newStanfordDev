import { useState } from "react";
import { Star } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";

export default function TestimonialForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please provide your name and message");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        name: name.trim(),
        company: company.trim() || null,
        message: message.trim(),
        rating: Number(rating) || null,
        approved: false,
        featured: false,
        displayOrder: 0,
        createdAt: serverTimestamp(),
      });
      toast.success("Thanks! Your testimonial was submitted for review.");
      setName("");
      setCompany("");
      setMessage("");
      setRating(5);
    } catch (err) {
      console.error("Submit testimonial failed", err);
      toast.error("Failed to submit testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 w-full"
    >
      <div>
        <h3 className="text-lg font-bold text-white">Share your experience</h3>
        <p className="text-sm text-slate-400">
          Short and specific testimonials help other clients — submissions are
          reviewed before publishing.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-slate-400 mb-1">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-400 mb-1">
            Company (optional)
          </span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm text-slate-400 mb-1">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </label>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                aria-label={`${v} star${v > 1 ? "s" : ""}`}
                className={`p-1 rounded-full transition-colors ${
                  rating >= v ? "bg-amber-500/20" : "hover:bg-white/5"
                }`}
              >
                <Star
                  className={`${
                    rating >= v ? "text-amber-400" : "text-slate-400"
                  }`}
                  size={18}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Your testimonial will be reviewed before publishing.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg text-white font-semibold disabled:opacity-60 shadow-md"
        >
          {submitting ? "Submitting..." : "Submit Testimonial"}
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setCompany("");
            setMessage("");
            setRating(5);
          }}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/60"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
