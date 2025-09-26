import React from "react";

/**
 * FooterBar
 * Shows: "<short> · <generated_at>" and links to the backend /version.
 * Props:
 *  - apiBase: string (like "http://localhost:5055" or prod URL)
 *  - version: { short?: string, commit?: string, generated_at?: string }
 */
export default function FooterBar({ apiBase, version }) {
  const short =
    (version && (version.short || (version.commit || "").slice(0, 7))) || "…";
  const when = (version && version.generated_at) || "…";

  const link = apiBase ? `${apiBase}/version` : "/version";

  const barStyle = {
    marginTop: "2rem",
    padding: "10px 14px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.85)",
    background: "transparent",
  };

  const linkStyle = {
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
    borderBottom: "1px dotted rgba(255,255,255,0.35)",
  };

  return (
    <footer style={barStyle} role="contentinfo" aria-label="Build info">
      <span>BRaiN Beacon</span>
      <a href={link} target="_blank" rel="noreferrer" style={linkStyle}>
        {short} · {when}
      </a>
    </footer>
  );
}
