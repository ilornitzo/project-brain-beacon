/**
 * VersionBadge — floats bottom-right, shows API short hash + generated_at.
 * Loads automatically when included from index.html as a type="module" script.
 */
(function () {
  const apiBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE) ||
    "https://project-brain-beacon-api.onrender.com";

  const root = document.createElement("div");
  root.id = "version-badge";
  Object.assign(root.style, {
    position: "fixed",
    right: "10px",
    bottom: "10px",
    zIndex: "9999",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    fontSize: "12px",
    background: "rgba(0,0,0,0.75)",
    color: "white",
    padding: "6px 8px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    opacity: "0.85",
    pointerEvents: "auto",
  });
  root.textContent = "version: …";
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(root);
  });

  async function load() {
    try {
      const r = await fetch(apiBase.replace(/\/+$/, "") + "/version", {
        headers: { "cache-control": "no-cache" },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const short = j?.short || "unknown";
      const when = j?.generated_at || "";
      root.innerHTML =
        `api <a href="${apiBase}/version" target="_blank" rel="noreferrer" style="color:#a0e3ff;text-decoration:underline;">${short}</a>` +
        (when ? ` · <span style="opacity:.8">${when}</span>` : "");
    } catch (e) {
      root.textContent = "api version: error";
      root.style.background = "rgba(128,0,0,0.8)";
      console.error("[VersionBadge]", e);
    }
  }

  load();
  setInterval(load, 60_000);
})();
