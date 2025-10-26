"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db, seed } from "@/lib/mockDb";

export default function RolePage() {
  seed(); // ensure mock data exists even on direct nav
  const p = useParams<{ id: string }>();
  const id = p?.id ?? "0";
  const role = db.roles.get(BigInt(id));
  if (!role) return <div className="opacity-70">Role not found.</div>;

  const projects = role.projects
    .map(pid => db.projects.get(pid)!)
    .sort((a, b) => Number(b.totalStake - a.totalStake));

  return (
<div className="space-y-6">
      <h2 className="text-xl font-semibold">{role.name} — Leaderboard</h2>
      <table className="w-full text-sm">
        <thead className="text-neutral-400">
  <tr>
    <th className="text-left">Project</th>
    <th>Stake <span className="text-xs opacity-60">(live via Envio)</span></th>
    <th>Stakers</th>
    <th></th>
  </tr>
</thead>
        <tbody>
          {projects.map(pj => (
            <tr key={pj.id.toString()} className="border-t border-neutral-800">
              <td className="py-3">{pj.uri}</td>
              <td className="text-center">{Number(pj.totalStake)/1e18}</td>
              <td className="text-center">{pj.stakers}</td>
              <td className="text-right"><Link className="underline" href={`/project/${pj.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs opacity-60">Planned: HyperIndex schema for ProjectRegistered, Staked, HireConfirmed to power real-time ranks.</div>
    </div>
  );
}
