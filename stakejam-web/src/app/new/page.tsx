"use client";
import { useState } from "react";
import { db, seed, addProject } from "@/lib/mockDb";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  seed();
  const router = useRouter();
  const roles = Array.from(db.roles.values());
  const [roleId, setRoleId] = useState(roles[0]?.id.toString() ?? "1");
  const [uri, setUri] = useState("");
  const [applicant, setApplicant] = useState("0x0000000000000000000000000000000000000000");

  const submit = () => {
    if (!uri) return alert("Enter IPFS/URL for your project");
    const p = addProject(BigInt(roleId), uri, applicant as any);
    alert(`Project #${p.id.toString()} created!`);
    router.push(`/project/${p.id}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Submit your project</h2>
      <div className="grid gap-4 max-w-xl">
        <label className="space-y-1">
          <div className="text-sm opacity-80">Role</div>
          <select
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.id.toString()} value={r.id.toString()}>{r.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <div className="text-sm opacity-80">Project URI (ipfs://… or https://…)</div>
          <input
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
            value={uri}
            onChange={(e)=>setUri(e.target.value)}
            placeholder="ipfs://Qm..."
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm opacity-80">Applicant Address (optional)</div>
          <input
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
            value={applicant}
            onChange={(e)=>setApplicant(e.target.value)}
            placeholder="0x..."
          />
        </label>
        <button onClick={submit} className="px-4 py-2 bg-white text-black rounded w-fit">
          Create Project
        </button>
      </div>
    </div>
  );
}
