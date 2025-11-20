import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-4 py-2 rounded bg-slate-800 border border-slate-700"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="flex-1 px-4 py-2 rounded bg-slate-800 border border-slate-700"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700"
      />
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      </div>
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-emerald-600 rounded text-white font-semibold disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Testimonial"}
        </button>
      </div>
    </form>
  );
}
