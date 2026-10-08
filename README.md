# Shamba AI

Plan a small food garden that works better together.

All three slices are complete, including the authenticated learner reviews. Final verification of later UI refinements passed: 104 tests, lint, typecheck, and production build. The 5-build final review and learning wrap-up are complete; ready to start 6-ship. Visitors can generate a companion-placement guide; signed-in users can save one garden, safely replace it, identify plants, and restore identification history. Supported crops are tomato, carrot, onion, and basil in rectangular outdoor gardens or raised beds measuring 1–5 meters per dimension.

## Local setup

Use Node 22.12+ or Node 24 and npm. This build was verified with the installed Node 24. Keep `.env.local` ignored; configure `RAPIDAPI_KEY` for both subscribed services and a random server-only `APP_SIGNING_SECRET` of at least 32 bytes. `.env.example` contains placeholders only. Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, pooled Neon `DATABASE_URL`, and direct Neon `DIRECT_URL`. Only the Clerk publishable key belongs in a `NEXT_PUBLIC_` variable. Never expose server secrets.

```bash
npm install
npm run db:deploy
npm run dev
```

Open http://localhost:3000. If the development compiler stalls on a cold start, stop that server and try `npm run dev -- --webpack`; the latest local session uses this alternative compiler. In an environment with multiple installed Node versions, select a supported version before installing/running commands. If port 3000 is busy, use the URL printed by Next.js.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Planning behavior

The browser calls `/api/plans`; the Next.js server alone calls RapidAPI. Requests use the live-verified string dimension/crop format. Responses are validated and normalized before display; no provider API key or raw payload reaches the browser. Plan receipts are signed for later saving and expire after 24 hours.

The map is illustrative relative placement, not a capacity estimate or exact-spacing blueprint. It omits generated plant counts, growth stages, and unsupported directional/location assumptions. Strong provider code-checked conflicts are distinct from traditional/generated advisories. The bounded renderer fails clearly if it cannot represent a strong separation; it does not become an optimization engine.

Normal tests use sanitized recorded responses and clearly labeled simulated edge cases; they make no RapidAPI requests. Live app generation consumes the shared subscription quota and has no automatic retry. Slow calls show progress and time out cleanly. Saving verifies the signed plan without another RapidAPI call. Editing produces a draft; replacement requires confirmation and the current revision. Replacement and history clearing happen in one serializable transaction. Retrying the same plan preserves newly created history. Sign-out clears private browser state immediately; a failed sign-out reloads the authenticated garden through the owned endpoint.

See [PRD](devpost/prd.md), [technical specification](devpost/spec.md), [build progress](devpost/checklist.md), and [API verification](devpost/api-verification.md). Git staging, commits, and publishing remain the developer's responsibility under `AGENTS.md`.

## Plant identification

From My Garden, choose **Identify an unwanted plant**. JPG, PNG, and WEBP images up to 3,000,000 bytes are used unchanged after decoding. Larger images receive bounded browser resizing/compression; the preview shows the processed file. The server independently checks size, format signatures, and garden ownership before forwarding temporary multipart data. Images are not stored permanently.

A confident result requires a valid name, boolean classification, finite provider score of at least 90/100, and usable identification evidence. The score is displayed as **Provider confidence: N/100**, not a calibrated probability. Confident weeds and non-weeds save automatically; uncertain results never enter history. Weed guidance passes only the approved two-sentence whole-item allowlist; other results show the approved fallback. Non-weeds show their classification without weed-control sections.

Signed result receipts bind save retries to the user and garden revision, avoiding another provider request. Replacement prevents an old result from attaching to the new garden. History is newest first and details show saved information without photos.

To revisit the completed Slice 3 learner check, use the real app at http://localhost:3000 to upload, identify, and reopen results after returning. Live identification spends provider quota; analysis has no automatic retry. A temporary development-only page at http://127.0.0.1:3100 provides explicitly labeled simulated weed/non-weed, uncertainty, API failure, and save failure states without quota. It uses real UI/photo preparation with simulated identity, API, and persistence; it does not prove authenticated integration and is not part of the application. Reloading it clears simulated history.

## Disposable database checks

Create a separate Neon branch named `shamba-slice-2-tests` from the application branch using regular branching (including migration history). Copy its **direct/unpooled** connection string into ignored `.env.local` as `TEST_DATABASE_URL`. Keep `DATABASE_URL` and `DIRECT_URL` pointing to the application branch. Test and application endpoints must differ; changing only credentials or the pooling suffix is insufficient.

```bash
npm run test:integration
```

The runner refuses a missing test URL or an application database target, applies committed migrations only to the test branch, and runs real PostgreSQL transaction checks. Cleanup deletes only records created by the test run. All seven checks passed against the guarded disposable branch. Do not use `prisma migrate reset` against the application database.

`npm install` generates the ignored Prisma client without connecting to the database. Migration scripts suppress provider output so connection settings stay private. Ordinary unit/component tests use simulated identity/database responses and do not prove PostgreSQL rollback by themselves. The authenticated Slice 2 and Slice 3 learner checks passed. See [the build checklist](devpost/checklist.md) for the completed verification and wrap-up record.
