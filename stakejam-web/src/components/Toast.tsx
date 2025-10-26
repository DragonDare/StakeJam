"use client";
import { useEffect, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 1600);
    return () => clearTimeout(id);
  }, [msg]);
  const Toast = () =>
    msg ? (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black text-sm px-4 py-2 rounded">
        {msg}
      </div>
    ) : null;
  return { setMsg, Toast };
}
