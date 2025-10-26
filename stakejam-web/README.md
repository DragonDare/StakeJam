# StakeJam — merit-first hiring via staking signals

**Pitch:** Stakers (field experts) stake on applicants’ project portfolios. Leaderboards surface top projects by stake. Employers interview from the top; when hires happen, staking pools pay out to backers. Focus on skills, not pedigree.

## How it works
- **Applicants** submit projects per role (Python, Java…) → on role-specific pools
- **Stakers** stake the role token on projects they believe in → signal = skin-in-the-game
- **Leaderboard** ranks projects by stake (and later: momentum/decay)
- **Employers** interview from the top; when hire confirmed (EIP-712), pool rewards backers

## Demo (this repo)
- Frontend: `stakejam-web` (Next.js 16, Tailwind, Wagmi + RainbowKit)
- Contracts: `/contracts` (WIP for hack; not required to run demo)
- State is persisted in `localStorage` (reset via “Reset demo” in header)

### Run locally
```bash
cd stakejam-web
yarn
yarn dev
