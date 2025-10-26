"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Header() {
  const reset = () => {
    localStorage.removeItem("stakejam-db");
    location.reload();
  };

  return (
    <header className="flex items-center justify-between">
      <nav className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold">StakeJam</Link>
        <Link href="/interviews" className="text-sm underline opacity-80 hover:opacity-100">Interviews</Link>
        <Link href="/new" className="text-sm underline opacity-80 hover:opacity-100">Submit Project</Link>
      </nav>
      <div className="flex items-center gap-3">
        <button onClick={reset} className="text-xs opacity-70 underline hover:opacity-100">Reset demo</button>
        <ConnectButton />
      </div>
    </header>
  );
}
