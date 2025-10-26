"use client";
import { useParams } from "next/navigation";
import { db, seed, stake as doStake } from "@/lib/mockDb";
import { useState } from "react";
import BridgeModal from "@/components/BridgeModal";
import { useToast } from "@/components/Toast";

export default function ProjectPage() {
  seed(); // ensure mock data exists on refresh/direct link
  const p = useParams<{ id: string }>();
  const id = p?.id ?? "0";
  const pid = BigInt(id);

  const proj = db.projects.get(pid);
  const [amt, setAmt] = useState("100");

  const [showBridge, setShowBridge] = useState(false);

  const { setMsg, Toast } = useToast();


  if (!proj) return <div className="opacity-70">Project not found.</div>;

  const stakeClick = () => {
    const num = Number(amt) || 0;
    const wei = BigInt(Math.floor(num * 1e18));
    doStake(pid, wei);
    setMsg(`Staked ${amt} token on #${proj.id}`);
};

  const hireClick = () => {
    alert("Employer signed EIP-712 (demo) and hire confirmed!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Project #{proj.id.toString()}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-neutral-900 p-5">
          <div className="font-medium mb-2">Details</div>
          <div className="text-sm opacity-80">URI: {proj.uri}</div>
          <div className="text-sm opacity-80">Pool: {proj.pool}</div>
          <div className="text-sm opacity-80">Total Stake: {Number(proj.totalStake)/1e18}</div>
          <div className="text-sm opacity-80">Stakers: {proj.stakers}</div>
        </div>
        <div className="rounded-xl bg-neutral-900 p-5 space-y-4">
          <div className="font-medium">Stake</div>
          <div className="flex gap-2">
            <input
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              placeholder="Amount"
            />
            <button onClick={stakeClick} className="px-4 py-2 bg-white text-black rounded">
              Stake
            </button>
          </div>
          <div className="font-medium pt-2">Employer</div>
          <button onClick={hireClick} className="px-4 py-2 bg-white text-black rounded">
            Confirm Hire (demo)
          </button>
        </div>
        <div className="font-medium pt-2">Cross-Chain</div>
            <button onClick={() => setShowBridge(true)} className="px-4 py-2 bg-white text-black rounded">
            Pay from any chain (Avail)
            </button>
            {showBridge && <BridgeModal onClose={() => setShowBridge(false)} />}
      </div>
      <Toast />
    </div>
  );
}
