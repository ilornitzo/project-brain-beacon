import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5055";

export default function PromptPackViewer() {
  const [text, setText] = useState("Loading prompt pack…");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/prompt_pack`)
      .then(r => r.text())
      .then(setText)
      .catch(() => setText("Error loading prompt pack"));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{border:"1px solid #333", padding:"12px", borderRadius:"8px", background:"#0f0f0f", color:"#ddd", whiteSpace:"pre-wrap", marginTop:"16px"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px"}}>
        <div style={{fontSize:"18px", fontWeight:600}}>Prompt Pack (Markdown)</div>
        <button onClick={copy} style={{padding:"6px 10px", border:"1px solid #666", borderRadius:"6px", background:"#1e1e1e", color:"#eee", cursor:"pointer"}}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{whiteSpace:"pre-wrap", margin:0}}>{text}</pre>
    </div>
  );
}
