# Shamba AI

Plan a small food garden that works better together.

Slice 1 supports visitor planning for a rectangular outdoor garden/raised bed: dimensions of 1–5 meters each, two to four selected crops (tomato, carrot, onion, basil), and a real server-generated companion-placement guide. Change Garden preserves the inputs. Slice 2 adds Clerk sign-in at saving, one saved garden per user, restoration, and confirmed replacement. Its disposable database checks pass; the authenticated browser and learner review remain pending, so Slice 2 is not marked complete. Plant identification arrives in Slice 3.

## Local setup

Use Node 22.12+ or Node 24 and npm. This build was verified with the installed Node 24. Keep `.env.local` ignored; configure `RAPIDAPI_KEY` for the subscribed companion service and a random server-only `APP_SIGNING_SECRET` of at least 32 bytes. `.env.example` contains placeholders only. Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, pooled Neon `DATABASE_URL`, and direct Neon `DIRECT_URL`. Only the Clerk publishable key belongs in a `NEXT_PUBLIC_` variable. Never expose server secrets.

```bash
npm install
npm run db:deploy
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

Normal tests use sanitized recorded responses and clearly labeled simulated edge cases; they make no RapidAPI requests. Live app generation consumes the shared subscription quota and has no automatic retry. Slow calls show progress and time out cleanly. Saving verifies the signed plan without another RapidAPI call. Editing produces a draft; replacement requires confirmation and the current revision. Replacement and history clearing happen in one serializable transaction. Retrying the same plan preserves newly created history. Sign-out clears private browser state.

See [PRD](devpost/prd.md), [technical specification](devpost/spec.md), [build progress](devpost/checklist.md), and [API verification](devpost/api-verification.md). Git staging, commits, and publishing remain the developer's responsibility under `AGENTS.md`.

## Disposable database checks

Create a separate Neon branch named `shamba-slice-2-tests` from the application branch using regular branching (including migration history). Copy its **direct/unpooled** connection string into ignored `.env.local` as `TEST_DATABASE_URL`. Keep `DATABASE_URL` and `DIRECT_URL` pointing to the application branch. Test and application endpoints must differ; changing only credentials or the pooling suffix is insufficient.

```bash
npm run test:integration
```

The runner refuses a missing test URL or an application database target, applies committed migrations only to the test branch, and runs real PostgreSQL transaction checks. Cleanup deletes only records created by the test run. All five checks passed against the guarded disposable branch. Do not use `prisma migrate reset` against the application database.

`npm install` generates the ignored Prisma client without connecting to the database. Migration scripts suppress provider output so connection settings stay private. Ordinary unit/component tests use simulated identity/database responses and do not prove PostgreSQL rollback by themselves. Actual signed-in browser checks and the learner review remain pending.
