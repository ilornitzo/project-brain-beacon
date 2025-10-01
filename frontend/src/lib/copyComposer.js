/**
 * BRaiN Copy v1 • JSON/YAML Composer with .brain.yml support + critical inlining
 * Runtime backfill: try /runtime, fallback to /healthz (extracting runtime.*)
 */
import yaml from "js-yaml";

const asUTC = (d=new Date()) => new Date(d.getTime() - (d.getTimezoneOffset()*60000)).toISOString();
const nonEmpty = (s, fb="") => (typeof s==="string" && s.trim()) ? s : fb;

async function safeFetch(url, opts) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) return { ok:false, status:r.status, data:null };
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (/\.ya?ml(\?|$)/i.test(url) || (r.headers.get("content-type")||"").toLowerCase().includes("yaml")) {
      const txt = await r.text();
      return { ok:true, status:r.status, data: yaml.load(txt) || {} };
    }
    if (url.endsWith(".md")) {
      return { ok:true, status:r.status, data: await r.text() };
    }
    if (ct.includes("application/json")) {
      return { ok:true, status:r.status, data: await r.json() };
    }
    const t = await r.text();
    try { return { ok:true, status:r.status, data: JSON.parse(t) }; }
    catch { return { ok:true, status:r.status, data: t }; }
  } catch {
    return { ok:false, status:0, data:null };
  }
}

export function parseCopyText(copyText="") {
  const i = copyText.indexOf("\n");
  const body = copyText.startsWith("//") && i !== -1 ? copyText.slice(i+1) : copyText;
  return JSON.parse(body);
}

function banner(projectId, source) {
  return `// BRaiN Copy v1 • project=${projectId || "brain"} • source=${source || "/stp.json"}\n`;
}
function bannerYaml(projectId, source) {
  return `# BRaiN Copy v1 • project=${projectId || "brain"} • source=${source || "/stp.json"}\n`;
}

async function fetchApiRuntime(API) {
  if (API) {
    // Try /runtime
    const r1 = await safeFetch(`${API}/runtime`);
    if (r1.ok && r1.data && typeof r1.data === "object" && (r1.data.python || r1.data.node || r1.data.os)) {
      return {
        python: r1.data.python || "",
        node:   r1.data.node   || "",
        os:     typeof r1.data.os === "string" ? r1.data.os : (r1.data.os?.system || ""),
      };
    }
    // Fallback to /healthz which (in your API) contains runtime info
    const r2 = await safeFetch(`${API}/healthz`);
    if (r2.ok && r2.data && typeof r2.data === "object") {
      const rt = r2.data.runtime || {};
      return {
        python: rt.python || "",
        node:   rt.node   || "",
        os:     typeof rt.os === "string" ? rt.os : (rt.os?.system || ""),
      };
    }
  }
  return { python:"", node:"", os:"" };
}

export async function composeCopyJSON({
  projectId="brain",
  repo = {},
  branch = "main",
  commit = { short: "", full: "" },
  runtime = {},
  endpoints = {},
  file_tree = [],
  prompt_pack = "",
  source = "/stp.json",
} = {}) {
  // 1) Load narrative
  let brain = {};
  if (typeof window !== 'undefined' && window.__BRAIN_OVERRIDE__) {
    const raw = window.__BRAIN_OVERRIDE__;
    brain = typeof raw === 'string' ? (yaml.load(raw) || {}) : raw;
  } else {
    const tryUrls = [`/brain.yml?ts=${Date.now()}`, `/brain.yml`];
    for (const u of tryUrls) {
      const r = await safeFetch(u);
      if (r.ok && r.data) {
        const b = typeof r.data === 'string' ? (yaml.load(r.data) || {}) : r.data;
        const hasNarrative = !!(b && (b.project || b.current_step || (Array.isArray(b.goals) && b.goals.length)));
        if (hasNarrative) { brain = b; break; }
      }
    }
  }
  try { console.debug('[BRaiN] brain.yml loaded:', brain); } catch {}

  // 2) Resolve API base
  const API = endpoints?.api_url || "";

  // 3) Prompt pack resolution (prefer API /prompt_pack)
  let pp = typeof prompt_pack === "string" && prompt_pack ? prompt_pack : "";
  if (!pp) {
    const candidates = [
      API ? `${API}/prompt_pack` : "",
      endpoints?.other?.prompt_pack_url || "",
      "/dist/prompt_pack.md",
    ].filter(Boolean);
    for (const u of candidates) {
      const t = await safeFetch(u);
      if (t.ok && typeof t.data === "string" && t.data.trim()) { pp = t.data; break; }
    }
  }
  // Sanitize accidental HTML fallbacks
  if (typeof pp === "string") {
    const head = pp.trim().slice(0, 80).toLowerCase();
    if (head.startsWith("<!doctype") || head.startsWith("<html")) pp = "";
  }

  // 4) Runtime backfill (use given runtime, else API /runtime → /healthz)
  const rtGiven = {
    python: runtime?.python || "",
    node:   runtime?.node   || "",
    os:     runtime?.os     || "",
  };
  const needBackfill = !(rtGiven.python && rtGiven.node && rtGiven.os);
  const rtApi = needBackfill ? await fetchApiRuntime(API) : rtGiven;
  const rt = {
    python: rtGiven.python || rtApi.python || "",
    node:   rtGiven.node   || rtApi.node   || "",
    os:     rtGiven.os     || rtApi.os     || "",
  };

  // 5) Build trace
  const build_trace = {
    repo: { name: nonEmpty(repo.name, brain?.project?.name || "project-brain-beacon"), remote: nonEmpty(repo.remote, "") },
    branch: nonEmpty(branch, "main"),
    commit,
    generated_at: asUTC(),
    runtime: rt,
    endpoints: Object.keys(endpoints||{}).length ? endpoints : (brain?.endpoints || {}),
  };

  // 6) Narrative/step
  const project_overview = {
    overview: brain?.project?.overview || "",
    capabilities: brain?.project?.capabilities || [],
    architecture: brain?.project?.architecture || [],
    data_sources: brain?.project?.data_sources || [],
    goals: brain?.goals || [],
  };

  const thread_brief = nonEmpty(
    brain?.project?.summary,
    `Project ${build_trace.repo.name} on ${build_trace.branch}. Current focus: ${brain?.current_step?.name || "n/a"}.`
  );

  const cs = brain?.current_step || { name: "Unknown", definition_of_done: [], commands: [] };
  const recent = Array.isArray(brain?.commands_recent) ? brain.commands_recent : [];
  const commands = Array.isArray(cs.commands) && cs.commands.length ? cs.commands : recent.slice(0,2);
  const current_step = { ...cs, commands };

  const troubleshooting = Array.isArray(brain?.troubleshooting) ? brain.troubleshooting : [];

  // 7) File tree + important files
  const file_tree_final=[], important_files=[];
  if (Array.isArray(file_tree)) {
    for (const f of file_tree) {
      if (typeof f === "string") {
        file_tree_final.push(f);
      } else if (f && typeof f.path === "string") {
        file_tree_final.push(f.path);
        const maxKB = (brain?.critical_files?.max_inline_kb ?? 10) * 1024;
        const bytes = typeof f.bytes === "number" ? f.bytes : (typeof f.content === "string" ? f.content.length : 0);
        if (typeof f.content === "string" && (f.inline === true || bytes <= maxKB)) {
          important_files.push({ path: f.path, bytes: bytes || f.content.length, inline: true, content: f.content });
        } else {
          important_files.push({ path: f.path, note: "ask by path" });
        }
      }
    }
  }

  // 8) Payload
  const payload = {
    build_trace,
    project_overview,
    thread_brief,
    current_step,
    troubleshooting,
    file_tree: file_tree_final.sort(),
    important_files,
    prompt_pack: typeof pp === "string" ? pp : "",
    footer: {
      startup_asks: {
        summary: "Summarize project state, confirm objective, list missing inputs.",
        next_actions: brain?.next_steps || [],
        commands: brain?.commands_recent || [],
      },
      rules: [
        "Treat .brain.yml + Prompt Pack as ground truth.",
        "Use full-file replacements.",
        "Use a Redline Notice if deviating.",
        "Snapshot Ritual after each step (git add/commit/tag + screenshot).",
        "Stop after 1–2 commands and wait for my output.",
      ],
      stop_rule: "Stop after 1–2 commands and wait for my output.",
    },
  };

  const text = banner(projectId, source) + JSON.stringify(payload, null, 2);
  return { text, json: payload, jsonOnly: JSON.stringify(payload) };
}

export async function composeCopyYAML(opts={}) {
  const { json } = await composeCopyJSON(opts);
  const yml = yaml.dump(json, { noRefs: true, lineWidth: 1000 });
  return { text: bannerYaml(opts.projectId, opts.source) + yml, yamlOnly: yml };
}

export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  try { document.execCommand("copy"); return true; }
  catch { return false; }
  finally { document.body.removeChild(el); }
}
