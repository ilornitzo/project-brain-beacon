import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5055";

export default function STPViewer() {
  const [text, setText] = useState("Loading STP…");

  useEffect(() => {
    fetch(`${BASE}/stp`)
      .then(r => r.text())
      .then(setText)
      .catch(() => setText("Error loading STP"));
  }, []);

  return (
    <div style={{border:"1px solid #333", padding:"12px", borderRadius:"8px", background:"#0f0f0f", color:"#ddd", whiteSpace:"pre-wrap"}}>
      <div style={{fontSize:"18px", fontWeight:600, marginBottom:"6px"}}>STP (YAML)</div>
      <pre style={{whiteSpace:"pre-wrap", margin:0}}>{text}</pre>
    </div>
  );
}
