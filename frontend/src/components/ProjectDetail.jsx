import { useEffect, useMemo, useState } from "react";
import { composeCopyJSON, copyToClipboard } from "../lib/copyComposer";
import { criticalFiles } from "../criticalRegistry";

function Section({ title, onCopy, children }) {
  return (
    <div className="border rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        {onCopy && (
          <button onClick={onCopy} className="px-2 py-1 rounded-md border text-xs hover:opacity-90">
            Copy section
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetail({
  projectId,
  repo = {},
  branch = "main",
  commit = {},
  runtime = {},
  endpoints = {},
  fileTree = [],
  promptPack = "",
}) {
  const [snap, setSnap] = useState(null);
  const [status, setStatus] = useState("");

  const effectiveTree = useMemo(
    () => (Array.isArray(fileTree) && fileTree.length ? fileTree : criticalFiles),
    [fileTree]
  );

  async function load() {
    setStatus("Loading…");
    try {
      const { json } = await composeCopyJSON({
        projectId, repo, branch, commit, runtime, endpoints,
        file_tree: effectiveTree,
        prompt_pack: promptPack,
        source: "/stp.json",
      });
      setSnap(json);
      setStatus("Loaded");
      setTimeout(() => setStatus(""), 1200);
    } catch (e) {
      console.error(e);
      setStatus("Load failed");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId, repo?.name]);

  function copyObj(obj, label) {
    const text = JSON.stringify(obj ?? {}, null, 2);
    copyToClipboard(text).then(ok => setStatus(ok ? `Copied ${label}` : `Copy failed`));
  }
  function copyAll() { copyObj(snap, "ALL"); }

  if (!snap) {
    return (
      <div className="border rounded-xl p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Project Detail</h2>
          <button onClick={load} className="px-2 py-1 rounded-md border text-xs">Refresh</button>
        </div>
        <div className="opacity-70 text-sm mt-2">{status || "Loading…"}</div>
      </div>
    );
  }

  const { build_trace, project_overview, thread_brief, current_step, troubleshooting, file_tree, important_files, prompt_pack, footer } = snap;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Project Detail</h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-2 py-1 rounded-md border text-xs">Refresh</button>
          <button onClick={copyAll} className="px-2 py-1 rounded-md border text-xs">Copy ALL</button>
          {status && <span className="text-xs opacity-80">{status}</span>}
        </div>
      </div>

      <Section title="Overview" onCopy={() => copyObj({ project_overview, thread_brief }, "Overview")}>
        <p className="text-sm whitespace-pre-wrap">{project_overview?.overview || "(no overview)"}</p>
        {Array.isArray(project_overview?.capabilities) && project_overview.capabilities.length > 0 && (
          <ul className="list-disc pl-5 text-sm">
            {project_overview.capabilities.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}
        {thread_brief && <div className="text-sm mt-2 opacity-80"><b>Thread brief:</b> {thread_brief}</div>}
      </Section>

      <Section title="Build Trace" onCopy={() => copyObj(build_trace, "Build Trace")}>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(build_trace, null, 2)}</pre>
      </Section>

      <Section title="Current Step" onCopy={() => copyObj(current_step, "Current Step")}>
        <div className="text-sm"><b>{current_step?.name || "(unnamed step)"}</b></div>
        {Array.isArray(current_step?.definition_of_done) && (
          <ul className="list-disc pl-5 text-sm">
            {current_step.definition_of_done.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
        {Array.isArray(current_step?.commands) && current_step.commands.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-medium">Commands:</div>
            <pre className="text-xs whitespace-pre-wrap">{current_step.commands.join("\n")}</pre>
          </div>
        )}
      </Section>

      <Section title="Next Steps & Startup Asks" onCopy={() => copyObj(footer?.startup_asks || {}, "Next/Startup")}>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(footer?.startup_asks || {}, null, 2)}</pre>
      </Section>

      <Section title="Troubleshooting" onCopy={() => copyObj(troubleshooting || [], "Troubleshooting")}>
        {Array.isArray(troubleshooting) && troubleshooting.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">
            {troubleshooting.map((t, i) => (
              <li key={i} className="mb-1">
                <b>{t.issue}</b> — {t.cause}
                {Array.isArray(t.fix) && t.fix.length > 0 && (
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{t.fix.join("\n")}</pre>
                )}
              </li>
            ))}
          </ul>
        ) : <div className="text-sm opacity-70">(empty)</div>}
      </Section>

      <Section title="File Tree" onCopy={() => copyObj(file_tree || [], "File Tree")}>
        <pre className="text-xs whitespace-pre-wrap">{(file_tree || []).join("\n")}</pre>
      </Section>

      <Section title="Important Files" onCopy={() => copyObj(important_files || [], "Important Files")}>
        {Array.isArray(important_files) && important_files.length > 0 ? (
          <div className="flex flex-col gap-2">
            {important_files.map((f, i) => (
              <details key={i} className="border rounded p-2">
                <summary className="text-sm">{f.path} {f.inline ? <span className="opacity-60">(inline)</span> : <span className="opacity-60">(reference)</span>}</summary>
                {f.inline && typeof f.content === "string" && (
                  <pre className="text-xs mt-2 whitespace-pre-wrap">{f.content}</pre>
                )}
              </details>
            ))}
          </div>
        ) : <div className="text-sm opacity-70">(none)</div>}
      </Section>

      <Section title="Prompt Pack" onCopy={() => copyObj({ prompt_pack }, "Prompt Pack")}>
        <pre className="text-xs whitespace-pre-wrap">{prompt_pack || "(empty)"}</pre>
      </Section>

      <Section title="Rules" onCopy={() => copyObj(footer || {}, "Footer / Rules")}>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(footer || {}, null, 2)}</pre>
      </Section>
    </div>
  );
}
