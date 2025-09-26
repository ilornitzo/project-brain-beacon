import { useEffect, useMemo, useState } from "react";
import "./App.css";
import apiBase from "./version-badge";
import PromptPackViewer from "./components/PromptPackViewer.jsx";
import STPViewer from "./components/STPViewer.jsx";
import StatusCard from "./components/StatusCard.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || apiBase || "";

function useFetchJSON(path, enabled = true) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let alive = true;
    async function go() {
      if (!enabled || !API_BASE) return;
      try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e) {
        if (alive) setErr(String(e));
      }
    }
    go();
    return () => { alive = false; };
  }, [path, enabled]);
  return { data, err };
}

function useFetchText(path, enabled = true) {
  const [text, setText] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let alive = true;
    async function go() {
      if (!enabled || !API_BASE) return;
      try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const t = await res.text();
        if (alive) setText(t);
      } catch (e) {
        if (alive) setErr(String(e));
      }
    }
    go();
    return () => { alive = false; };
  }, [path, enabled]);
  return { text, err };
}

function Section({ title, children }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const stp = useFetchJSON("/stp.json", !!API_BASE);
  const promptPack = useFetchText("/prompt_pack", !!API_BASE);
  const runtime = useFetchJSON("/runtime", !!API_BASE);
  const diffstat = useFetchJSON("/diffstat", !!API_BASE);
  const version = useFetchJSON("/version", !!API_BASE);

  const [copied, setCopied] = useState(false);

  const buildTrace = useMemo(() => {
    const commitShort =
      (version.data && (version.data.short || version.data.commit?.slice(0, 7))) || "unknown";
    const commitFull =
      (version.data && version.data.commit) || "unknown";
    const gen = (version.data && version.data.generated_at) || new Date().toISOString();
    return [
      "### Build trace",
      `commit: ${commitShort} (${commitFull})`,
      `generated_at: ${gen}`,
      "",
    ].join("\n");
  }, [version.data]);

  const runtimeBlock = useMemo(() => {
    const py = runtime.data?.python || "unknown";
    const os = runtime.data?.os
      ? `${runtime.data.os.system} ${runtime.data.os.release} (${runtime.data.os.machine})`
      : "unknown";
    const api = runtime.data?.api_base || API_BASE || "unknown";
    const web = runtime.data?.web_base || (typeof window !== "undefined" ? window.location.origin : "");
    const when = runtime.data?.generated_at || new Date().toISOString();
    return [
      "### Runtime snapshot",
      `python: ${py}`,
      `os: ${os}`,
      `api_base: ${api}`,
      `web_base: ${web}`,
      `snapshot_at: ${when}`,
      "",
    ].join("\n");
  }, [runtime.data]);

  const diffBlock = useMemo(() => {
    const tag = diffstat.data?.latest_tag || "(none)";
    const range = diffstat.data?.range || "";
    const entries = (diffstat.data?.entries || []).map(e => `${e.status}\t${e.path}`);
    const list = entries.length ? entries.join("\n") : "(no changes since latest step tag)";
    return [
      "### Diffstat since latest step-* tag",
      `latest_tag: ${tag}`,
      range ? `range: ${range}` : "",
      "",
      list,
      "",
    ].join("\n");
  }, [diffstat.data]);

  const footer = useMemo(() => {
    return [
      "## How to start a new ChatGPT thread (universal)",
      "1) Paste the whole block you just copied into a fresh thread.",
      '2) Begin with: "You are my project mentor. Read everything below and acknowledge."',
      "3) Then continue with the **Startup Asks** verbatim.",
      "",
      "## Startup Asks (always do these first)",
      "1) In 5 sentences max, summarize the project and current state using only the provided materials.",
      "2) List 2–3 **next_actions** with a clear **Definition of Done** for each.",
      "3) Give me only **1–2 copy-paste terminal commands** to run next (assume repo root), **then stop and wait for my output**.",
      "",
      "## Rules of Engagement (universal)",
      "- **Ground Truth:** Treat the Prompt Pack + STP snapshot as the single source of truth. If something is missing, **ask for the exact repo path** you need (e.g., `frontend/src/App.jsx`).",
      "- **Full-File Replacements:** When changing code, provide **complete files** (no partial snippets).",
      "- **Redline Notice:** If you must deviate from the plan, issue a short *Redline Notice* with rationale and safer alternatives before proceeding.",
      "- **Snapshot Ritual:** After each meaningful change, guide me to: `git add -A && git commit -m \"<msg>\" && git tag -f step-XX && git push --follow-tags` (and capture any requested screenshots).",
      "- **No Improvising:** If unsure, ask a clarifying question. Do **not** fabricate paths, APIs, or behavior.",
      "",
      "(Universal footer — reusable across projects)",
      "",
    ].join("\n");
  }, []);

  const makeCopyBlock = () => {
    const header = [
      buildTrace,
      "# Project Brain Beacon — Prompt Pack",
      `Generated: ${(stp.data && stp.data.generated_at) || new Date().toISOString()}`,
      "",
      "## Project",
      `- Name: ${stp.data?.project?.name || "unknown"}`,
      `- Branch: ${stp.data?.git?.branch || "main"}`,
      `- Remote: ${stp.data?.git?.remote || ""}`,
      "",
      "## Git Snapshot",
      `- Last commit: ${stp.data?.git?.last_commit || version.data?.commit || "unknown"}`,
      `- Author: ${stp.data?.git?.author || "unknown"}`,
      `- Date: ${stp.data?.git?.date || runtime.data?.generated_at || ""}`,
      "",
      "## Repo Tree (trimmed)",
      ...(stp.data?.files?.trimmed_tree || []).map(line => `- ${line}`),
      "",
      "## Recreate snapshot",
      `Run: python3 tools/stp_make.py  &&  ls -la dist`,
      "",
      "## Guidance for AI",
      "- Treat this file and stp.yaml as ground truth.",
      "- If a needed file is not inlined in stp.yaml, ask for it explicitly.",
      "",
    ].join("\n");

    const pp = promptPack.text
      ? promptPack.text.trim()
      : "## Prompt Pack\n(loading or unavailable)";

    const enriched = [runtimeBlock, diffBlock, footer].join("\n");

    return [header, pp, enriched].join("\n---\n");
  };

  async function handleCopy() {
    try {
      const text = makeCopyBlock();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
      alert("Copy failed — see console for details.");
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Project Brain Beacon</h1>
        <div className="actions">
          <button onClick={handleCopy} title="Copy prompt pack with build trace, runtime, and diffstat">
            {copied ? "Copied ✓" : "Copy (enriched)"}
          </button>
        </div>
      </header>

      <main>
        <Section title="Status">
          <StatusCard title="API Base" value={API_BASE || "(unset)"} />
          <StatusCard title="Commit" value={version.data?.short || "(…)"}/>
          <StatusCard title="Runtime Python" value={runtime.data?.python || "(…)"}/>
        </Section>

        <Section title="STP Preview">
          <STPViewer apiBase={API_BASE} />
        </Section>

        <Section title="Prompt Pack">
          <PromptPackViewer apiBase={API_BASE} />
        </Section>
      </main>

      <footer className="app-footer">
        <small>Powered by Soltrae • Copy now includes runtime & diffstat</small>
      </footer>
    </div>
  );
}
