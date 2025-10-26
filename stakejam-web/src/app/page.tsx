"use client";
import Link from "next/link";
import { db, seed, recentTxs } from "@/lib/mockDb";

seed();

export default function Home() {
  const roles = Array.from(db.roles.values());
  const txs = recentTxs();

  return (
    <div className="space-y-8">
      <section>
        {/* 👇 Wrap your Roles header and add Submit Project link */}
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Roles</h2>
          <Link
            href="/new"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Submit Project
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <Link
              key={r.id.toString()}
              href={`/role/${r.id}`}
              className="block rounded-xl p-5 bg-neutral-900 hover:bg-neutral-800"
            >
              <div className="text-lg font-medium">{r.name}</div>
              <div className="text-sm opacity-70">
                Projects: {r.projects.length}
              </div>
              <div className="text-sm opacity-70">
                TVL: {Number(r.tvl) / 1e18} token
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Recent activity</h2>
        <ul className="space-y-1">
          {txs.map((tx) => (
            <li
              key={tx.hash}
              className="text-sm opacity-80 flex items-center justify-between"
            >
              <span>{tx.label}</span>
              <a
                className="underline opacity-70 hover:opacity-100"
                href={`https://sepolia.blockscout.com/tx/${tx.hash}`} // Blockscout link
                target="_blank"
                rel="noreferrer"
              >
                View on Blockscout
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
