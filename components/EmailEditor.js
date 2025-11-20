import React, { useRef, useEffect } from "react";

export default function EmailEditor({ value = "", onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    // Only update the editable content when the prop `value` differs
    // from the current innerHTML and the editor is not focused. This
    // prevents resetting the caret while the user is typing (which
    // can make text appear to type backwards).
    const el = editorRef.current;
    if (!el) return;
    try {
      const isFocused = document.activeElement === el;
      if (!isFocused && el.innerHTML !== value) {
        el.innerHTML = value;
      }
    } catch (e) {
      // ignore DOM access errors in SSR or unusual environments
    }
  }, [value]);

  const exec = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      // trigger change
      onChange && onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    } catch (e) {
      console.warn("execCommand failed", e);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL (include https://)", "https://");
    if (url) exec("createLink", url);
  };

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button type="button" onClick={() => exec("bold")} className="px-2 py-1 bg-slate-800 rounded">B</button>
        <button type="button" onClick={() => exec("italic")} className="px-2 py-1 bg-slate-800 rounded">I</button>
        <button type="button" onClick={() => exec("insertUnorderedList")} className="px-2 py-1 bg-slate-800 rounded">• List</button>
        <button type="button" onClick={insertLink} className="px-2 py-1 bg-slate-800 rounded">Link</button>
        <button type="button" onClick={() => exec("removeFormat")} className="px-2 py-1 bg-slate-800 rounded">Clear</button>
      </div>

      <div
        ref={editorRef}
        onInput={(e) => onChange && onChange(e.currentTarget.innerHTML)}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[160px] p-3 rounded bg-slate-800 text-white border border-slate-700"
      />
    </div>
  );
}
