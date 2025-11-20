import React, { useState } from "react";
import EmailEditor from "./EmailEditor";
import { wrapWithEmailWrapper } from "../lib/mail/templates";

export default function AdminMailConsole() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [lastReport, setLastReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  async function sendBroadcast() {
    if (!subject || !html)
      return setStatus("Please set subject and message body.");
    setSending(true);
    setStatus("Sending...");
    try {
      const res = await fetch("/api/mail/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (data.ok) {
        const msg = `Sent ${data.sent} emails${
          data.failed && data.failed.length
            ? `, ${data.failed.length} failed`
            : ""
        }`;
        setStatus(msg);
        setLastReport(data);
      } else {
        setStatus(`Error: ${data.error}`);
        setLastReport(data);
      }
    } catch (err) {
      setStatus("Send error: " + (err.message || String(err)));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
      <h3 className="text-lg font-semibold">Mail Console</h3>
      <div>
        <label className="block text-sm text-slate-400">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mt-1 p-2 rounded bg-slate-800 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400">
          Message (WYSIWYG)
        </label>
        <EmailEditor value={html} onChange={setHtml} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={sendBroadcast}
          disabled={sending}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Send to all clients
        </button>
        <button
          onClick={() => {
            setSubject("Announcement from StanfordDev");
            setHtml("<p>Hi —<br/>We have an update.</p>");
          }}
          className="bg-slate-700 px-3 py-2 rounded"
        >
          Load sample
        </button>
        <button
          onClick={() => {
            // prepare wrapped preview
            const wrapped = wrapWithEmailWrapper(html || "<p>(empty)</p>", {
              preheader: (subject || "").slice(0, 120),
            });
            setPreviewHtml(wrapped);
            setShowPreview(true);
          }}
          className="bg-slate-700 px-3 py-2 rounded"
        >
          Preview
        </button>
      </div>

      <div className="text-sm text-slate-300 mt-2">{status}</div>

      {lastReport?.failed && lastReport.failed.length > 0 && (
        <div className="mt-3 p-3 bg-slate-800 rounded text-sm text-amber-200">
          <div className="font-semibold mb-2">Failed recipients</div>
          <div className="max-h-32 overflow-auto text-xs">
            {lastReport.failed.map((f, i) => (
              <div key={i} className="border-b border-slate-700/40 py-1">
                {f.to} — {f.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative w-[95%] md:w-3/4 lg:w-2/3 h-[80%] bg-white rounded overflow-auto shadow-2xl z-10">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="text-lg font-semibold">Preview: {subject}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-3 py-1 bg-slate-800 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div
              className="p-4 bg-white overflow-auto"
              style={{ height: "calc(100% - 64px)" }}
            >
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
