import { useEffect, useRef, useState } from "react";
import { composeCopyJSON, copyToClipboard, parseCopyText } from "../lib/copyComposer";
import { criticalFiles } from "../criticalRegistry";

export default function FooterBar({
  projectId = null,
  repo = {},
  branch = "",
  commit = {},
  runtime = {},
  endpoints = {},
  fileTree = [],          // optional override; if empty we fall back to criticalFiles
  promptPack = "",
}) {
  const [status, setStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const preRef = useRef(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(t);
  }, [status]);

  function getEffectiveFileTree() {
    // If the page didn't pass a fileTree, use the critical registry
    return (Array.isArray(fileTree) && fileTree.length) ? fileTree : criticalFiles;
  }

  async function buildText() {
    const { text } = await composeCopyJSON({
      projectId,
      repo,
      branch,
      commit,
      runtime,
      endpoints,
      file_tree: getEffectiveFileTree(),
      prompt_pack: promptPack,
      source: "/stp.json",
    });
    return text;
  }

  const handlePreview = async () => {
    const text = await buildText();
    setPreviewText(text);
    setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;
    console.log("BRaiN COPY PREVIEW →", text);
  };

  const handleCopy = async () => {
    setStatus("Building JSON…");
    const text = await buildText();

    // Validate keys
    let valid = false;
    try {
      const obj = parseCopyText(text);
      valid = ["build_trace","project_overview","thread_brief","current_step","troubleshooting","file_tree","important_files","prompt_pack","footer"]
        .every(k => Object.prototype.hasOwnProperty.call(obj, k));
    } catch {}

    const ok = await copyToClipboard(text);
    setPreviewText(text);
    setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;

    if (ok && valid) setStatus("Copied JSON ✅ (valid)");
    else if (ok) setStatus("Copied JSON ⚠️ (parse check failed)");
    else setStatus("Copy failed — press ⌘C after Select JSON");
  };

  const handleSelect = async () => {
    if (!previewOpen) {
      const text = await buildText();
      setPreviewText(text);
      setPreviewOpen(true);
      window.__BRAIN_LAST_COPY__ = text;
    }
    setTimeout(() => {
      const pre = preRef.current;
      if (!pre) return;
      const range = document.createRange();
      range.selectNodeContents(pre);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setStatus("Selected — press ⌘C");
    }, 0);
  };

  const handleDownload = async () => {
    const text = await buildText();
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "brain_snapshot.json";
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
    setStatus("Downloaded snapshot ⬇️");
    setPreviewText(text); setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;
  };

  return (
    <div className="w-full border-t px-3 py-2 flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="opacity-70">
          Push ritual: <code>git fetch origin && git rebase origin/main && git push origin main</code>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePreview} className="px-3 py-1.5 rounded-xl border hover:opacity-90 active:opacity-80">Preview JSON</button>
          <button onClick={handleCopy} className="px-3 py-1.5 rounded-xl border hover:opacity-90 active:opacity-80">Copy JSON</button>
          <button onClick={handleSelect} className="px-3 py-1.5 rounded-xl border hover:opacity-90 active:opacity-80" title="Auto-select JSON so you can press ⌘C">Select JSON</button>
          <button onClick={handleDownload} className="px-3 py-1.5 rounded-xl border hover:opacity-90 active:opacity-80">Download JSON</button>
          {status && <span className="opacity-80">{status}</span>}
        </div>
      </div>

      {previewOpen && (
        <div className="border rounded-xl p-2 overflow-auto max-h-64">
          <pre ref={preRef} className="text-xs whitespace-pre-wrap">{previewText}</pre>
        </div>
      )}
    </div>
  );
}
