import { useEffect, useState } from "react";
import { composeCopyJSON, copyToClipboard, parseCopyText } from "./lib/copyComposer";

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

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const handleCopy = async () => {
    setStatus("Building JSON…");
    const { text } = await composeCopyJSON({
      projectId,
      repo,
      branch,
      commit,
      runtime,
      endpoints,
      file_tree: fileTree,
      prompt_pack: promptPack,
      current_step: {
        name: "Step-16a — Restore JSON Copy Composer",
        dod: [
          "Valid JSON with required sections in order",
          "Uses selected project URLs",
          "Starts with debug banner",
          "Tag step-16a pushed",
        ],
        commands: [
          "git fetch origin && git rebase origin/main",
          "git switch -c feat/step-16a-copy-json",
        ],
      },
      source: "/stp.json",
    });

    // Validate parseability (strip banner then JSON.parse)
    let valid = false;
    try {
      const obj = parseCopyText(text);
      // Light sanity checks on required top-level keys
      valid = ["build_trace","thread_brief","current_step","troubleshooting","file_tree","important_files","prompt_pack","footer"]
        .every(k => Object.prototype.hasOwnProperty.call(obj, k));
      if (!valid) console.warn("Copy JSON missing required keys", Object.keys(obj));
    } catch (e) {
      console.error("Copy JSON parse failed:", e);
    }

    const ok = await copyToClipboard(text);
    if (ok && valid) setStatus("Copied JSON ✅ (valid)");
    else if (ok) setStatus("Copied JSON ⚠️ (parse check failed)");
    else setStatus("Copy failed — see console");
    if (!ok) console.log(text);
  };

  return (
    <div className="w-full border-t px-3 py-2 flex items-center justify-between gap-2 text-sm">
      <div className="opacity-70">
        Push ritual: <code>git fetch origin && git rebase origin/main && git push origin main</code>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl border hover:opacity-90 active:opacity-80"
          title="Copy structured JSON (with debug banner) to clipboard"
        >
          Copy JSON
        </button>
        {status && <span className="opacity-80">{status}</span>}
      </div>
    </div>
  );
}
