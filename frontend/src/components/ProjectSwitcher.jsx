import React, { useEffect, useMemo, useState } from "react";

/**
 * ProjectSwitcher
 * Props:
 *  - projects: [{ id, name, stp_url, ai_url, prompt_pack_url, tags }]
 *  - selectedId: string | null
 *  - onSelect: (projectId) => void
 */
export default function ProjectSwitcher({ projects = [], selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.tags || []).some(t => String(t).toLowerCase().includes(q))
    );
  }, [projects, query]);

  const selected = useMemo(
    () => projects.find(p => p.id === selectedId) || null,
    [projects, selectedId]
  );

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ position: "relative", minWidth: 280 }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            textAlign: "left"
          }}
          title="Click to choose a project"
        >
          {selected ? `${selected.name} (${selected.id})` : "Select a project…"}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              zIndex: 20,
              background: "rgba(24,24,28,0.98)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
            }}
          >
            <input
              autoFocus
              placeholder="Filter by name, id, or tag…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                marginBottom: 8
              }}
            />
            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                borderRadius: 8
              }}
            >
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid transparent",
                    background:
                      p.id === selectedId
                        ? "rgba(64,132,255,0.15)"
                        : "transparent",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {p.id} • {(p.tags || []).join(", ")}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  No matches. Try a different search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
