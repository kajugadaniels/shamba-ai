# Shamba AI

Plan a small food garden that works better together.

Slice 1 supports visitor planning for a rectangular outdoor garden/raised bed: dimensions of 1–5 meters each, two to four selected crops (tomato, carrot, onion, basil), and a real server-generated companion-placement guide. Change Garden preserves the inputs. Saving, accounts, and plant identification are scheduled for the next approved slices and are not available yet.

## Local setup

Use Node 22.12+ or Node 24 and npm. This build was verified with the installed Node 24. Keep `.env.local` ignored; configure `RAPIDAPI_KEY` for the subscribed companion service and a random server-only `APP_SIGNING_SECRET` of at least 32 bytes. `.env.example` contains placeholders only. Never prefix these secrets with `NEXT_PUBLIC_`.

```bash
npm install
npm run dev
```

Open http://localhost:3000. In an environment with multiple installed Node versions, select a supported version before installing/running commands. If port 3000 is busy, use the URL printed by Next.js.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Planning behavior

The browser calls `/api/plans`; the Next.js server alone calls RapidAPI. Requests use the live-verified string dimension/crop format. Responses are validated and normalized before display; no provider API key or raw payload reaches the browser. Plan receipts are signed for later saving and expire after 24 hours.

The map is illustrative relative placement, not a capacity estimate or exact-spacing blueprint. It omits generated plant counts, growth stages, and unsupported directional/location assumptions. Strong provider code-checked conflicts are distinct from traditional/generated advisories. The bounded renderer fails clearly if it cannot represent a strong separation; it does not become an optimization engine.

Normal tests use sanitized recorded responses and clearly labeled simulated edge cases; they make no RapidAPI requests. Live app generation consumes the shared subscription quota and has no automatic retry. Slow calls show progress and time out cleanly. Nothing is saved to a database in Slice 1.

See [PRD](devpost/prd.md), [technical specification](devpost/spec.md), [build progress](devpost/checklist.md), and [API verification](devpost/api-verification.md). Git staging, commits, and publishing remain the developer's responsibility under `AGENTS.md`.
