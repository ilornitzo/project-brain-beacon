import { useState } from "react";

export default function EndOfThreadUpdate() {
  const [visible, setVisible] = useState(false);

  const command = `python3 tools/brain_update.py \\
  --step "Step-XX — (fill in next step)" \\
  --dod "(fill in Definition of Done)" \\
  --next "Step-YY — (fill in upcoming)" \\
  --add-command "git fetch origin && git rebase origin/main && git push origin main" \\
  --trouble "issue|cause|fix1;fix2" \\
&& git add .brain.yml && git commit -m "chore(brain): update roadmap + recent commands" && git push`;

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(command);
      alert("End-of-thread update command copied to clipboard. Paste in your terminal, edit the placeholders, and run.");
    } catch {
      // Fallback: open a small window to copy manually
      const w = window.open("", "_blank", "width=600,height=400,noopener,noreferrer");
      if (w) {
        w.document.write(`<pre style="white-space:pre-wrap;font:12px ui-monospace,Menlo,monospace;padding:12px;">${command
          .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</pre>`);
        w.document.close();
      }
    }
  }

  return (
    <div className="border rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">End of Thread Update</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisible(!visible)}
            className="px-2 py-1 rounded-md border text-xs hover:opacity-90"
          >
            {visible ? "Hide" : "Show"}
          </button>
          <button
            onClick={copyCmd}
            className="px-2 py-1 rounded-md border text-xs hover:opacity-90"
            title="Copy the update command to clipboard"
          >
            Copy Command
          </button>
        </div>
      </div>
      {visible && (
        <div>
          <p className="text-sm opacity-80 mb-2">
            Copy this, paste into your terminal, fill in the placeholders (step/DoD/next/troubleshooting), then run:
          </p>
          <pre className="text-xs whitespace-pre-wrap bg-gray-100 rounded p-2">
            {command}
          </pre>
        </div>
      )}
    </div>
  );
}
