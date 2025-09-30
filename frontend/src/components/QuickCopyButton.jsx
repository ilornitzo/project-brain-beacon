import { useState } from "react";
import { composeCopyJSON, copyToClipboard } from "../lib/copyComposer";
import { criticalFiles } from "../criticalRegistry";

export default function QuickCopyButton({
  projectId,
  repo = {},
  branch = "main",
  commit = {},
  runtime = {},
  endpoints = {},
  label = "Quick Copy",
}) {
  const [status, setStatus] = useState("");

  function downloadText(text, name="brain_snapshot.json") {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  }

  async function handleCopy() {
    setStatus("Building…");
    try {
      const { text } = await composeCopyJSON({
        projectId, repo, branch, commit, runtime, endpoints,
        file_tree: criticalFiles,
        prompt_pack: "",
        source: "/stp.json",
      });
      const ok = await copyToClipboard(text);
      if (ok) {
        setStatus("Copied ✅");
      } else {
        downloadText(text);
        setStatus("Clipboard blocked — downloaded ⬇️");
      }
      setTimeout(() => setStatus(""), 2000);
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
