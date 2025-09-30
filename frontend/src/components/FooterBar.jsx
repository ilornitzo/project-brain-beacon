import { useEffect, useRef, useState } from "react";
import { composeCopyJSON, composeCopyYAML, copyToClipboard, parseCopyText } from "../lib/copyComposer";
import { criticalFiles } from "../criticalRegistry";

export default function FooterBar({
  projectId = null,
  repo = {},
  branch = "",
  commit = {},
  runtime = {},
  endpoints = {},
  fileTree = [],
  promptPack = "",
}) {
  const [status, setStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewKind, setPreviewKind] = useState("json"); // 'json' | 'yaml'
  const [clipboardBlocked, setClipboardBlocked] = useState(false);
  const preRef = useRef(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 3000);
    return () => clearTimeout(t);
  }, [status]);

  function effectiveTree() {
    return (Array.isArray(fileTree) && fileTree.length) ? fileTree : criticalFiles;
  }

  async function build(kind="json") {
    const base = {
      projectId, repo, branch, commit, runtime, endpoints,
      file_tree: effectiveTree(),
      prompt_pack: promptPack,
      source: "/stp.json",
    };
    if (kind === "yaml") return await composeCopyYAML(base);
    return await composeCopyJSON(base);
  }

  const handlePreview = async (kind="json") => {
    const { text } = await build(kind);
    setPreviewText(text);
    setPreviewKind(kind);
    setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;
    console.log("BRaiN COPY PREVIEW →", kind.toUpperCase(), text);
  };

  function selectPre() {
    const pre = preRef.current;
    if (!pre) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  const handleCopy = async (kind="json") => {
    setStatus("Building…");
    const { text } = await build(kind);

    // Validate only for JSON
    let valid = true;
    if (kind === "json") {
      try {
        const obj = parseCopyText(text);
        valid = ["build_trace","project_overview","thread_brief","current_step","troubleshooting","file_tree","important_files","prompt_pack","footer"]
          .every(k => Object.prototype.hasOwnProperty.call(obj, k));
      } catch { valid = false; }
    }

    const ok = await copyToClipboard(text);
    setPreviewText(text);
    setPreviewKind(kind);
    setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;

    if (ok && valid) {
      setClipboardBlocked(false);
      setStatus(`Copied ${kind.toUpperCase()} ✅`);
    } else if (ok) {
      setClipboardBlocked(false);
      setStatus(`Copied ${kind.toUpperCase()} ⚠️ (structure check failed)`);
    } else {
      // Clipboard blocked → auto-select so user can ⌘C
      setClipboardBlocked(true);
      setStatus("Clipboard blocked — selected for ⌘C");
      setTimeout(selectPre, 0);
    }
  };

  const handleSelect = async () => {
    if (!previewOpen) await handlePreview(previewKind);
    setTimeout(() => {
      selectPre();
      setStatus("Selected — press ⌘C");
    }, 0);
  };

  const handleDownload = async (kind="json") => {
    const { text } = await build(kind);
    const ext = kind === "yaml" ? "yaml" : "json";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `brain_snapshot.${ext}`;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
    setStatus(`Downloaded ${ext.toUpperCase()} ⬇️`);
    setPreviewText(text); setPreviewKind(kind); setPreviewOpen(true);
    window.__BRAIN_LAST_COPY__ = text;
  };

  return (
    <div className="w-full border-t px-3 py-2 flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="opacity-70">
          Push ritual: <code>git fetch origin && git rebase origin/main && git push origin main</code>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handlePreview("json")} className="px-3 py-1.5 rounded-xl border">Preview JSON</button>
          <button onClick={() => handleCopy("json")}    className="px-3 py-1.5 rounded-xl border">Copy JSON</button>
          <button onClick={() => handleDownload("json")}className="px-3 py-1.5 rounded-xl border">Download JSON</button>

          <span className="opacity-50">|</span>

          <button onClick={() => handlePreview("yaml")} className="px-3 py-1.5 rounded-xl border">Preview YAML</button>
          <button onClick={() => handleCopy("yaml")}    className="px-3 py-1.5 rounded-xl border">Copy YAML</button>
          <button onClick={() => handleDownload("yaml")}className="px-3 py-1.5 rounded-xl border">Download YAML</button>

          {status && <span className="opacity-80">{status}</span>}
        </div>
      </div>

      {clipboardBlocked && (
        <div className="text-xs opacity-80 -mt-2">
          Clipboard permission is blocked in this browser. Use <b>Select</b> or <b>Download</b>, or allow Clipboard for this site in browser settings.
        </div>
      )}

      {previewOpen && (
        <div className="border rounded-xl p-2 overflow-auto max-h-64">
          <pre ref={preRef} className="text-xs whitespace-pre-wrap">{previewText}</pre>
          <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
            Previewing: {previewKind.toUpperCase()} ·
            <button onClick={handleSelect} className="underline">Select</button>
            <span>then ⌘C to copy</span>
          </div>
        </div>
      )}
    </div>
  );
}
