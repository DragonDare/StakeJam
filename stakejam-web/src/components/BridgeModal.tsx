"use client";
import { useState } from "react";

export default function BridgeModal({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-xl p-6 w-[480px] space-y-4">
        <div className="text-lg font-semibold">Pay from any chain (Avail)</div>
        <div className="text-sm opacity-80">
          Route preview: <br />
          <code>Base USDC → (Avail Nexus Bridge & Execute) → Sepolia RoleToken → Stake</code>
        </div>
        <button
          className="px-4 py-2 bg-white text-black rounded disabled:opacity-50"
          onClick={() => { setPending(true); setTimeout(()=>{ setPending(false); onClose(); alert("Intent submitted (demo)"); }, 1200); }}
          disabled={pending}
        >
          {pending ? "Submitting..." : "Submit Intent"}
        </button>
        <button className="px-3 py-2 text-sm underline opacity-70" onClick={onClose}>Close</button>
        <div className="text-xs opacity-60">
          This button will call Avail Nexus SDK (Bridge & Execute) in the real build.
        </div>
      </div>
    </div>
  );
}
