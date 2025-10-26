"use client";
import Link from "next/link";
import { db, seed } from "@/lib/mockDb";

export default function InterviewsPage() {
  seed();
  const projects = Array.from(db.projects.values())
    .sort((a,b)=> Number(b.totalStake - a.totalStake))
    .slice(0, 8);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Interview Queue (Top by Stake)</h2>
      <table className="w-full text-sm">
        <thead className="text-neutral-400">
          <tr><th className="text-left">Project</th><th>Role</th><th>Stake</th><th>Pool</th><th></th></tr>
        </thead>
        <tbody>
          {projects.map(p => {
            const role = db.roles.get(p.roleId)!;
            return (
              <tr key={p.id.toString()} className="border-t border-neutral-800">
                <td className="py-3">{p.uri}</td>
                <td className="text-center">{role.name}</td>
                <td className="text-center">{Number(p.totalStake)/1e18}</td>
                <td className="text-xs opacity-70">{p.pool}</td>
                <td className="text-right"><Link className="underline" href={`/project/${p.id}`}>Open</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs opacity-60">Coming soon: rank by momentum (24h delta) via Envio indexer.</div>
    </div>
  );
}
