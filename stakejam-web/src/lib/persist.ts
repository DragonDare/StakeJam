// BigInt-safe JSON helpers
function replacer(_k: string, v: unknown) {
  return typeof v === "bigint" ? { __bigint__: v.toString() } : v;
}
function reviver(_k: string, v: any) {
  return v && typeof v === "object" && "__bigint__" in v ? BigInt(v.__bigint__) : v;
}

export function save(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data, replacer));
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw, reviver) as T;
  } catch {
    return fallback;
  }
}
