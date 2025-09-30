import { useState } from "react";

export default function AddProjectWizard({ apiBase }) {
  const [form, setForm] = useState({
    stp_url: "",
    ai_url: "",
    prompt_pack_url: "",
    name: "",
    id: "",
    tags: "",
    snapshotText: ""
  });
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleValidate(e) {
    e.preventDefault();
    setStatus("Validating…");
    setResult(null);

    const payload = {
      stp_url: form.stp_url.trim(),
      ai_url: form.ai_url.trim(),
      prompt_pack_url: form.prompt_pack_url.trim(),
      name: form.name.trim(),
      id: form.id.trim(),
      tags: form.tags ? form.tags.split(",").map(s=>s.trim()).filter(Boolean) : []
    };

    // Optional: snapshot pasted directly
    if (form.snapshotText.trim()) {
      try {
        payload.snapshot = JSON.parse(form.snapshotText);
      } catch (e) {
        setStatus("Snapshot JSON is invalid.");
        return;
      }
    }

    try {
      const res = await fetch(`${apiBase}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.json().catch(()=>({detail:res.statusText}));
        throw new Error(t.detail || res.statusText);
      }
      const json = await res.json();
      setResult(json);
      setStatus("Validated — ready to commit.");
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  async function copy(str) {
    try {
      await navigator.clipboard.writeText(str);
      setStatus("Copied ✓");
      setTimeout(()=>setStatus(""),1200);
    } catch {
      setStatus("Copy failed");
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleValidate} className="space-y-2">
        <div className="text-sm opacity-70">
          Paste your project's <b>Snapshot URL</b> (STP JSON), or paste a <b>snapshot JSON</b> below.
          You can also prefill name/id/tags and AI/Prompt URLs.
        </div>

        <label className="text-sm">Snapshot URL (stp.json)</label>
        <input
          name="stp_url"
          value={form.stp_url}
          onChange={onChange}
          placeholder="https://…/stp.json"
          className="w-full border rounded px-2 py-1"
        />

        <details>
          <summary className="text-sm opacity-80 cursor-pointer">Optional: Paste snapshot JSON directly</summary>
          <textarea
            name="snapshotText"
            value={form.snapshotText}
            onChange={onChange}
            rows={8}
            className="w-full border rounded px-2 py-1"
            placeholder='{"build_trace":…}'
          />
        </details>

        <div className="grid md:grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Project Name (optional)</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-2 py-1" placeholder="Griffin Map Quiz"/>
          </div>
          <div>
            <label className="text-sm">Project ID (optional)</label>
            <input name="id" value={form.id} onChange={onChange} className="w-full border rounded px-2 py-1" placeholder="griffin-map-quiz"/>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          <div>
            <label className="text-sm">AI URL (optional)</label>
            <input name="ai_url" value={form.ai_url} onChange={onChange} className="w-full border rounded px-2 py-1" placeholder="https://…/ai"/>
          </div>
          <div>
            <label className="text-sm">Prompt Pack URL (optional)</label>
            <input name="prompt_pack_url" value={form.prompt_pack_url} onChange={onChange} className="w-full border rounded px-2 py-1" placeholder="https://…/prompt_pack"/>
          </div>
          <div>
            <label className="text-sm">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={onChange} className="w-full border rounded px-2 py-1" placeholder="map, quiz, training"/>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-1.5 rounded-xl border hover:bg-gray-50">Validate & Add</button>
          {status && <span className="text-sm opacity-80">{status}</span>}
        </div>
      </form>

      {result && result.ok && (
        <div className="border rounded-xl p-3 space-y-2 bg-gray-50">
          <div className="text-sm">
            <b>Added/Updated:</b> {result.project.name} <span className="opacity-70">({result.project.id})</span>
          </div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result.project, null, 2)}</pre>
          <div className="text-sm mt-1"><b>Commit:</b></div>
          <pre className="text-xs whitespace-pre-wrap">{result.git_command}</pre>
          <div className="flex gap-2">
            <button onClick={()=>copy(result.git_command)} className="px-3 py-1.5 rounded-xl border hover:bg-white">Copy Command</button>
          </div>
        </div>
      )}
    </div>
  );
}
