import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5055";

function parseFromYaml(yamlText) {
  const getLine = (re) => {
    const m = yamlText.match(re);
    return m ? m[1].replace(/^"|"$/g, "").trim() : "unknown";
  };
  const generatedAt = getLine(/^generated_at:\s*(.+)$/m);
  let tag = getLine(/^\s*tag:\s*(.+)$/m);
  if (tag === "unknown") tag = getLine(/^\s*branch:\s*(.+)$/m);
  return { generatedAt, tag };
}

export default function StatusCard() {
  const [health, setHealth] = useState("checking...");
  const [meta, setMeta] = useState({ generatedAt: "unknown", tag: "unknown" });

  useEffect(() => {
    fetch(`${BASE}/healthz`)
      .then(r => r.json()).then(d => setHealth(d?.ok ? "ok" : "not ok"))
      .catch(() => setHealth("error"));

    fetch(`${BASE}/stp`)
      .then(r => r.text())
      .then(t => setMeta(parseFromYaml(t)))
      .catch(() => setMeta({ generatedAt: "unknown", tag: "unknown" }));
  }, []);

  return (
    <div style={{border:"1px solid #333", padding:"12px", borderRadius:"8px", background:"#161616", color:"#eee", marginBottom:"16px"}}>
      <div style={{fontSize:"18px", fontWeight:600, marginBottom:"6px"}}>Status</div>
      <div>Health: <strong>{health}</strong></div>
      <div>Generated: <strong>{meta.generatedAt}</strong></div>
      <div>Branch/Tag: <strong>{meta.tag}</strong></div>
    </div>
  );
}
