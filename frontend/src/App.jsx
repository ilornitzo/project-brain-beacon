import { useEffect, useMemo, useState } from "react";
import "./App.css";
import apiBase from "./version-badge";
import STPViewer from "./components/STPViewer.jsx";
import PromptPackViewer from "./components/PromptPackViewer.jsx";
import StatusCard from "./components/StatusCard.jsx";
import FooterBar from "./components/FooterBar.jsx";
import ProjectSwitcher from "./components/ProjectSwitcher.jsx";
import QuickCopyButton from "./components/QuickCopyButton.jsx";

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
          {/* Keep the existing (old) header copy button if you still want it rendered by its component */}
        </div>
      </header>

      <main className="space-y-8">
        {/* Launcher list with Quick Copy per project */}
        <section>
          <h2>Projects</h2>
          {!projects.length ? (
            <div className="opacity-70">No projects found in /index.json.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between border rounded-xl p-2">
                  <div className="flex flex-col">
                    <div className="font-medium">{p.name} <span className="opacity-70">({p.id})</span></div>
                    <div className="text-xs opacity-70">
                      STP: {p.stp_url || "—"} · AI: {p.ai_url || "—"} · Prompt: {p.prompt_pack_url || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <QuickCopyButton
                      projectId={p.id}
                      repo={{ name: p.name || "project" }}
                      branch="main"
                      commit={{}}
                      runtime={{}}
                      endpoints={{
                        // Map known URLs into endpoints “other” so they travel in build_trace
                        app_url: "",
                        api_url: "",
                        docs_url: p.ai_url || "",
                        other: {
                          stp_url: p.stp_url || "",
                          prompt_pack_url: p.prompt_pack_url || "",
                          ai_url: p.ai_url || ""
                        }
                      }}
                      label="Quick Copy"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <h2>Status</h2>
          <StatusCard title="API Base" value={API_BASE || "(unset)"} />
          <StatusCard title="Project" value={selected ? `${selected.name} (${selected.id})` : "(none)"} />
          <StatusCard title="Health" value={health.data?.ok ? "ok" : "(…)"} />
          <StatusCard title="Runtime Python" value={runtime.data?.python || "(…)"} />
        </section>

        <section className="section">
          <h2>STP Preview</h2>
          <STPViewer apiBase={API_BASE} stpUrl={stpUrl} />
        </section>

        <section className="section">
          <h2>Prompt Pack</h2>
          <PromptPackViewer apiBase={API_BASE} promptUrl={promptUrl} />
        </section>
      </main>

      <FooterBar apiBase={API_BASE} version={version.data || {}} />
    </div>
  );
}
