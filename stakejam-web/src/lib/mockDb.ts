import { save, load } from "./persist";

export type Role = {
  id: bigint; name: string; token: `0x${string}`; chainId: number; tvl: bigint; projects: bigint[];
};
export type Project = {
  id: bigint; roleId: bigint; applicant: `0x${string}`; uri: string; pool: `0x${string}`; totalStake: bigint; stakers: number;
};
export type Tx = { hash: `0x${string}`; label: string; time: number };

const addr = (n: number) => `0x${n.toString().padStart(40, "0")}` as `0x${string}`;

type DB = { roles: Array<[bigint, Role]>; projects: Array<[bigint, Project]>; txs: Tx[] };
const raw = load<DB>("stakejam-db", { roles: [], projects: [], txs: [] });

// Rehydrate Maps from arrays (keys and bigint fields are already revived by load())
const roles = new Map<bigint, Role>(raw.roles);
const projects = new Map<bigint, Project>(raw.projects);
const txs: Tx[] = raw.txs;

export const db = { roles, projects, txs };

// Initialise id counters from persisted content
let roleSeq = (roles.size ? (Array.from(roles.keys()).reduce((m, k) => (k > m ? k : m), 0n) + 1n) : 1n);
let projSeq = (projects.size ? (Array.from(projects.keys()).reduce((m, k) => (k > m ? k : m), 0n) + 1n) : 1n);

// Persist helper (serialize Maps to arrays for storage)
function persist() {
  save("stakejam-db", {
    roles: Array.from(db.roles.entries()),
    projects: Array.from(db.projects.entries()),
    txs: db.txs,
  });
}

export function seed() {
  if (db.roles.size) return; // already seeded from storage
  const py: Role = { id: roleSeq++, name: "Python Developer", token: addr(1), chainId: 11155111, tvl: 0n, projects: [] };
  const jv: Role = { id: roleSeq++, name: "Java Developer",   token: addr(2), chainId: 11155111, tvl: 0n, projects: [] };
  db.roles.set(py.id, py); db.roles.set(jv.id, jv);
  addProject(py.id, "ipfs://demo1", addr(1001));
  addProject(py.id, "ipfs://demo2", addr(1002));
  persist(); // ✅ persist after initial seed
}

export function addProject(roleId: bigint, uri: string, applicant: `0x${string}`) {
  const pool = addr(Number(8000n + projSeq));
  const p: Project = { id: projSeq++, roleId, applicant, uri, pool, totalStake: 0n, stakers: 0 };
  db.projects.set(p.id, p);
  db.roles.get(roleId)!.projects.push(p.id);
  persist(); // ✅ persist after mutation
  return p;
}

export function stake(projectId: bigint, amount: bigint) {
  const p = db.projects.get(projectId)!;
  p.totalStake += amount;
  p.stakers += 1;
  const r = db.roles.get(p.roleId)!;
  r.tvl += amount;
  db.txs.unshift({
    hash: addr(Date.now()).slice(0, 66) as `0x${string}`,
    label: `Staked ${Number(amount) / 1e18} on #${projectId}`,
    time: Date.now(),
  });
  db.txs.splice(10);
  persist(); // ✅ persist after mutation
}

export function recentTxs() {
  return db.txs.slice(0, 5);
}
