import { useState } from "react";
import { composeCopyJSON, copyToClipboard } from "../lib/copyComposer";
import { criticalFiles } from "../criticalRegistry";

export default function QuickCopyButton({
  projectId,
  repo = {},
  branch = "main",
  commit = {},
  runtime = {},
  endpoints = {},     // { app_url, api_url, docs_url, other? } or per-project URLs
  label = "Quick Copy",
}) {
  const [status, setStatus] = useState("");

  async function handleCopy() {
    setStatus("Building…");
    try {
      const { text } = await composeCopyJSON({
        projectId,
        repo,
        branch,
        commit,
        runtime,
        endpoints,
        file_tree: criticalFiles,  // high-signal files inline; rest ask-by-path
        prompt_pack: "",           // leave empty unless you’ve fetched it
        source: "/stp.json",
      });
      const ok = await copyToClipboard(text);
      setStatus(ok ? "Copied ✅" : "Opened copy tab — press ⌘C");
      // Small auto-clear
      setTimeout(() => setStatus(""), 1800);
    } catch (e) {
      console.error("QuickCopy failed:", e);
      setStatus("Copy failed");
      setTimeout(() => setStatus(""), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-2.5 py-1 rounded-md border text-sm hover:opacity-90 active:opacity-80"
      title="Copy full BRaiN JSON snapshot for this project"
    >
      {status || label}
    </button>
  );
}
