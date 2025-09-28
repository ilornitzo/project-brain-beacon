import { useEffect, useMemo, useState } from "react";
import "./App.css";
import apiBase from "./version-badge";
import STPViewer from "./components/STPViewer.jsx";
import PromptPackViewer from "./components/PromptPackViewer.jsx";
import StatusCard from "./components/StatusCard.jsx";
import FooterBar from "./components/FooterBar.jsx";
import ProjectSwitcher from "./components/ProjectSwitcher.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || apiBase || "";
const SELECT_KEY = "brain.selectedProjectId";

function useFetchJSONAbs(url) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let alive = true;
    async function go() {
      if (!url) return;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e) {
        if (alive) setErr(String(e));
      }
    }
    go();
    return () => { alive = false; };
  }, [url]);
  return { data, err };
}

function useFetchJSON(path) {
  return useFetchJSONAbs(API_BASE ? `${API_BASE}${path}` : null);
}

export default function App() {
  // Load index + version for footer
  const index = useFetchJSON("/index.json");
  const version = useFetchJSON("/version");

  // Selection persistence
  const [selectedId, setSelectedId] = useState(() => {
    try { return localStorage.getItem(SELECT_KEY) || null; } catch { return null; }
  });
  const projects = index.data?.projects || [];

  // Choose current project (fallback to first if none)
  const selected = useMemo(() => {
    if (!projects.length) return null;
    const byId = projects.find(p => p.id === selectedId);
    return byId || projects[0];
  }, [projects, selectedId]);

  useEffect(() => {
    if (selected?.id) {
      try { localStorage.setItem(SELECT_KEY, selected.id); } catch {}
    }
  }, [selected?.id]);

  // Derived endpoints for viewers + copy
  const stpUrl = selected?.stp_url || (API_BASE ? `${API_BASE}/stp.json` : null);
  const promptUrl = selected?.prompt_pack_url || (API_BASE ? `${API_BASE}/prompt_pack` : null);
  const aiUrl = selected?.ai_url || (API_BASE ? `${API_BASE}/ai` : null);

  // Runtime/health for status cards
  const health = useFetchJSON("/healthz");
  const runtime = useFetchJSON("/runtime");

  // Copy payload (uses selected project URLs)
  const buildTrace = useMemo(() => {
    const short = version.data?.short || version.data?.commit?.slice(0, 7) || "unknown";
    const gen = version.data?.generated_at || new Date().toISOString();
    return [
      "### Build trace",
      `commit: ${short} (${version.data?.commit || "unknown"})`,
      `generated_at: ${gen}`,
      ""
    ].join("\n");
  }, [version.data]);

  const headerBlock = useMemo(() => {
    return [
      "# Project BRaiN Beacon — Prompt Pack",
      `Generated: ${new Date().toISOString()}`,
      "",
      "## Project (selected)",
      `- ID: ${selected?.id || "(none)"}`,
      `- Name: ${selected?.name || "(none)"}`,
      `- STP: ${stpUrl || "(unset)"}`,
      `- AI Guide: ${aiUrl || "(unset)"}`,
      `- Prompt Pack: ${promptUrl || "(unset)"}`
    ].join("\n");
  }, [selected, stpUrl, aiUrl, promptUrl]);

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
      "- **Ground Truth:** Treat the Prompt Pack + STP snapshot as the single source of truth. If something is missing, **ask for the exact repo path**.",
      "- **Full-File Replacements:** Provide **complete files** (no partial snippets).",
      "- **Redline Notice:** If you must deviate, include rationale and safer alternatives.",
      "- **Snapshot Ritual:** `git add -A && git commit -m \"<msg>\" && git tag -f step-XX && git push --follow-tags`.",
      "- **No Improvising:** If unsure, ask first.",
      "",
      "(Universal footer — reusable across projects)",
      ""
    ].join("\n");
  }, []);

  function makeCopyBlock() {
    const body = [
      buildTrace,
      headerBlock,
      "---",
      "## Link targets",
      `STP JSON: ${stpUrl || "(unset)"}`,
      `AI Guide: ${aiUrl || "(unset)"}`,
      `Prompt Pack: ${promptUrl || "(unset)"}`
    ].join("\n");
    return [body, footer].join("\n---\n");
  }

  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      const text = makeCopyBlock();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      alert("Copy failed — see console");
      console.error(e);
    }
  }

  const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };

  return (
    <div className="App">
      <header className="app-header" style={headerStyle}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h1>Project BRaiN Beacon</h1>
          {/* Project Switcher */}
          <ProjectSwitcher
            projects={projects}
            selectedId={selected?.id || null}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>
        <div className="actions">
          <button onClick={handleCopy} title="Copy prompt with selected project links">
            {copied ? "Copied ✓" : "Copy (selected project)"}
          </button>
        </div>
      </header>

      <main>
        <div className="section">
          <h2>Status</h2>
          <StatusCard title="API Base" value={API_BASE || "(unset)"} />
          <StatusCard title="Project" value={selected ? `${selected.name} (${selected.id})` : "(none)"} />
          <StatusCard title="Health" value={health.data?.ok ? "ok" : "(…)"}/>
          <StatusCard title="Runtime Python" value={runtime.data?.python || "(…)"}/>
        </div>

        <div className="section">
          <h2>STP Preview</h2>
          <STPViewer apiBase={API_BASE} stpUrl={stpUrl} />
        </div>

        <div className="section">
          <h2>Prompt Pack</h2>
          <PromptPackViewer apiBase={API_BASE} promptUrl={promptUrl} />
        </div>
      </main>

      <FooterBar apiBase={API_BASE} version={version.data || {}} />
    </div>
  );
}
