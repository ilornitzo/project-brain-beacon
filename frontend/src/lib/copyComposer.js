/**
 * BRaiN Copy v1 • JSON Composer with .brain.yml support + critical inlining
 */
import yaml from "js-yaml";

const asUTC = (d=new Date()) => new Date(d.getTime() - (d.getTimezoneOffset()*60000)).toISOString();
const nonEmpty = (s, fb="") => (typeof s==="string" && s.trim()) ? s : fb;

async function safeFetch(url, opts) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) return null;
    if (url.endsWith(".yml") || url.endsWith(".yaml")) {
      const txt = await r.text();
      return yaml.load(txt) || {};
    }
    if (url.endsWith(".md")) return await r.text();
    return await r.json();
  } catch { return null; }
}

export function parseCopyText(copyText="") {
  const i = copyText.indexOf("\n");
  const body = copyText.startsWith("//") && i !== -1 ? copyText.slice(i+1) : copyText;
  return JSON.parse(body);
}

function banner(projectId, source) {
  return `// BRaiN Copy v1 • project=${projectId || "brain"} • source=${source || "/stp.json"}\n`;
}

export async function composeCopyJSON(opts={}) {
  const {
    projectId="brain", repo={}, branch="main", commit={short:"",full:""},
    runtime={}, endpoints={}, file_tree=[], prompt_pack="", source="/stp.json",
  } = opts;

  const brain = await safeFetch("/brain.yml") || {};
  await (safeFetch("/dist/index.json") || safeFetch("/index.json"));

  let pp = (typeof prompt_pack === "string" && prompt_pack) ? prompt_pack : (await safeFetch("/dist/prompt_pack.md")) || "";
  if (typeof pp === "string") {
    const head = pp.trim().slice(0,50).toLowerCase();
    if (head.startsWith("<!doctype") || head.startsWith("<html")) pp="";
  }

  const build_trace = {
    repo: { name: nonEmpty(repo.name, brain?.project?.name || "project-brain-beacon"), remote: nonEmpty(repo.remote,"") },
    branch: nonEmpty(branch,"main"),
    commit, generated_at: asUTC(), runtime,
    endpoints: Object.keys(endpoints||{}).length ? endpoints : (brain?.endpoints || {}),
  };

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

  const cs = brain?.current_step || { name:"Unknown", definition_of_done:[], commands:[] };
  const recent = Array.isArray(brain?.commands_recent) ? brain.commands_recent : [];
  const commands = Array.isArray(cs.commands)&&cs.commands.length ? cs.commands : recent.slice(0,2);
  const current_step = { ...cs, commands };

  const troubleshooting = Array.isArray(brain?.troubleshooting) ? brain.troubleshooting : [];

  const file_tree_final=[], important_files=[];
  if (Array.isArray(file_tree)) {
    for (const f of file_tree) {
      if (typeof f==="string") file_tree_final.push(f);
      else if (f && typeof f.path==="string") {
        file_tree_final.push(f.path);
        const maxKB=(brain?.critical_files?.max_inline_kb??10)*1024;
        const okSize=(typeof f.bytes==="number"?f.bytes<=maxKB:(typeof f.content==="string"?f.content.length<=maxKB:false));
        if (typeof f.content==="string" && (f.inline===true||okSize)) {
          important_files.push({ path:f.path, bytes:f.bytes??f.content.length, inline:true, content:f.content });
        } else {
          important_files.push({ path:f.path, note:"ask by path" });
        }
      }
    }
  }

  const prompt_pack_final=typeof pp==="string"?pp:"";

  const footer = {
    startup_asks:{ summary:"Summarize project state, confirm objective, list missing inputs.", next_actions:brain?.next_steps||[], commands:brain?.commands_recent||[] },
    rules:[
      "Treat .brain.yml + Prompt Pack as ground truth.",
      "Use full-file replacements.",
      "Use a Redline Notice if deviating.",
      "Snapshot Ritual after each step (git add/commit/tag + screenshot).",
      "Stop after 1–2 commands and wait for my output.",
    ],
    stop_rule:"Stop after 1–2 commands and wait for my output.",
  };

  const payload={ build_trace, project_overview, thread_brief, current_step, troubleshooting,
                  file_tree:file_tree_final.sort(), important_files, prompt_pack:prompt_pack_final, footer };

  const text=banner(projectId,source)+JSON.stringify(payload,null,2);
  return { text,json:payload,jsonOnly:JSON.stringify(payload) };
}

/** Clipboard helper: simple version */
export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta=document.createElement("textarea");
  ta.value=text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return true;
}
