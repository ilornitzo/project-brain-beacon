import React, { useEffect, useState } from "react";

/**
 * STPViewer
 * Props:
 *  - apiBase: default API base (fallback)
 *  - stpUrl: optional absolute URL to JSON STP (overrides apiBase)
 */
export default function STPViewer({ apiBase, stpUrl }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const url = stpUrl || (apiBase ? `${apiBase}/stp.json` : null);

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

  if (err) return <pre style={{ opacity: 0.8 }}>STP error: {String(err)}</pre>;
  if (!data) return <div style={{ opacity: 0.7 }}>Loading STP…</div>;

  return (
    <pre className="viewer-block">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
