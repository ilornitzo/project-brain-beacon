/**
 * Canonical API base used by the frontend and Copy payload.
 * Exports BOTH a default and a named export for compatibility.
 */
const apiBase =
  (import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.VITE_API_BASE) ||
  "http://127.0.0.1:5090";

export default apiBase;
export { apiBase };
