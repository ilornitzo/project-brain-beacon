import { useEffect, useState } from "react";

const apiBase =
  (import.meta?.env?.VITE_API_BASE && import.meta.env.VITE_API_BASE.replace(/\/+$/,"")) ||
  "https://project-brain-beacon-api.onrender.com";

const UNIVERSAL_FOOTER = `
---
## How to start a new ChatGPT thread (universal)
1) Paste the whole block you just copied into a fresh thread.
2) Begin with: "You are my project mentor. Read everything below and acknowledge."
3) Then continue with the **Startup Asks** verbatim.

## Startup Asks (always do these first)
1) In 5 sentences max, summarize the project and current state using only the provided materials.
2) List 2–3 **next_actions** with a clear **Definition of Done** for each.
3) Give me only **1–2 copy-paste terminal commands** to run next (assume repo root), then **stop and wait** for my output.

## Rules of Engagement (universal)
- **Ground Truth:** Treat the Prompt Pack + STP snapshot as the single source of truth. If something is missing, **ask for the exact repo path** you need (e.g., \`frontend/src/App.jsx\`).
- **Full-File Replacements:** When changing code, provide **complete files** (no partial snippets).
- **Redline Notice:** If you must deviate from the plan, issue a short *Redline Notice* with rationale and safer alternatives before proceeding.
- **Snapshot Ritual:** After each meaningful change, guide me to: \`git add -A && git commit -m "<msg>" && git tag -f step-XX && git push --follow-tags\` (and capture any requested screenshots).
- **No Improvising:** If unsure, ask a clarifying question. Do **not** fabricate paths, APIs, or behavior.

(Universal footer — reusable across projects)
`.trim();

export default function App() {
  const [health, setHealth] = useState(null);
  const [stp, setStp] = useState("");
  const [pack, setPack] = useState("");
  const [version, setVersion] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [h, s, p, v] = await Promise.all([
          fetch(`${apiBase}/healthz`).then(r => r.json()),
          fetch(`${apiBase}/stp`).then(r => r.text()),
          fetch(`${apiBase}/prompt_pack`).then(r => r.text()),
          fetch(`${apiBase}/version`).then(r => r.json()).catch(() => null),
        ]);
        setHealth(h); setStp(s); setPack(p); setVersion(v);
      } catch (e) {
        console.error(e);
        setError(String(e));
      }
    }
    load();
  }, []);

  async function handleCopy() {
    try {
      const buildTrace = [
        "### Build trace",
        `commit: ${version?.short ?? "unknown"}${version?.commit ? ` (${version.commit})` : ""}`,
        `generated_at: ${version?.generated_at ?? "unknown"}`,
        "",
      ].join("\n");

      const text = [buildTrace, pack.trim(), "", UNIVERSAL_FOOTER].join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      setError("Failed to copy to clipboard.");
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Project Brain Beacon</h1>
        <span style={{ opacity: 0.7, fontSize: 14 }}>
          API: {apiBase.replace(/^https?:\/\//,'')}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, padding: "4px 8px", borderRadius: 8, background: "#eef" }}>
          {version ? `commit ${version.short ?? "unknown"} · ${version.generated_at ?? "…"}` : "loading version…"}
        </span>
      </header>

      {error && (
        <div style={{ background: "#fee", border: "1px solid #f99", color: "#900", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Health</h3>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {health ? JSON.stringify(health, null, 2) : "loading…"}
          </pre>
        </div>

        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Prompt Pack</h3>
            <button
              onClick={handleCopy}
              style={{
                marginLeft: "auto",
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: copied ? "#d1fae5" : "#f6f6f6",
                cursor: "pointer",
              }}
              title="Copy Prompt Pack with universal footer"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {pack || "loading…"}
          </pre>
        </div>

        <details style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <summary style={{ cursor: "pointer" }}>STP Snapshot (stp.yaml)</summary>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{stp || "loading…"}</pre>
        </details>
      </section>

      {/* Floating version badge stays (from Step-08) */}
      <div id="version-badge-mount" />
    </div>
  );
}
