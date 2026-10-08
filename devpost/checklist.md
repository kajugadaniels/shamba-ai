---
doc: checklist
status: approved
---

# Shamba AI — Build Checklist

Build mode: learn — pause after each mechanically verified slice for the learner check and a brief explanation of important implementation decisions. Keep final learner review and feedback.

The scope, PRD, and technical specification are approved. The learner approved this build order without reordering or merging slices. Slice 1 is complete; Slice 2 is complete after mechanical verification and the learner’s authenticated review. Slice 3 is implemented and mechanically verified, awaiting its learner review. Each slice delivers usable behavior across the necessary layers. Styling, responsive behavior, error handling, and verification are part of each slice rather than deferred plumbing tasks.

Git execution override: `AGENTS.md` and `git.md` require developer-only Git mutations. `Commit:` describes the checkpoint intent; the assistant supplies a separate exact-path add/Conventional Commit block for every changed non-ignored file, never executes those commands, and never stages secrets or the learner profile. Record implementation verification separately from developer commit confirmation; never claim a commit happened without read-only evidence or developer confirmation.

## Slices

- [x] **1. Generate and adjust a real companion-placement guide**
  Becomes usable: A visitor enters valid dimensions, selects two to four crops, calls the companion API, and sees a proportional labeled map with evidence-aware explanations; Change Garden returns to editable inputs.
  Why now: Delivers the planning half of the kernel immediately and tests the real API-to-map path before adding accounts or persistence. Scaffold and configuration support this behavior within the slice.
  PRD ref: `prd.md > Garden Planning Form`, `prd.md > Garden Plan Preview`, `prd.md > Input Validation`, `prd.md > Companion-Planting Layout`, `prd.md > Companion Conflict Evidence`, `prd.md > Responsive Layout and Motion`.
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Garden Form`, `spec.md > Garden Map and Plan Preview`, `spec.md > Companion Planting API`, `spec.md > File Structure`.
  Build: Scaffold Next.js/TypeScript with CSS Modules, Manrope, Motion, Zod, and focused test tooling. Implement the form, public plan Route Handler, server-only provider fetch, normalized contracts, signed plan receipt, draft preview/change flow, and bounded deterministic map arrangement. Preserve dimensions/selections on failure. Reject missing/extra crops and unsupported strong separations without inventing capacity. Provide honest Save Garden messaging until saving is delivered by slice 2; no false persistence. Create secret-free environment/startup instructions. Load existing local credentials without printing or rewriting them.
  Verify (mechanical): Run lint, typecheck, relevant Vitest/RTL tests, and production build. Use the two sanitized companion fixtures for coverage/repetition/evidence checks; simulated strong/traditional/contradictory cases must be explicitly labeled. Verify receipt signature tampering and expiry. Start the app and inspect the form/map/change path in the browser at narrow and wide widths with reduced motion. Run at most one justified live companion request to verify application integration if fixture/transport checks cannot establish it; record quota evidence without credentials. Never replace a real response with an unlabeled sample in the product.
  Learner check: Open http://localhost:3000, try an invalid dimension and fewer than two crops, then generate a valid plan. Confirm crop labels, dimensions, advisory wording, and mobile readability. Choose Change Garden and confirm the inputs remain available. Report what feels clear or needs adjustment.
  Commit: Planning checkpoint intent: `feat(planning): deliver visitor garden guide`; provide per-file commands under the manual Git rules.

- [x] **2. Save, restore, and safely replace one garden**
  Becomes usable: Save Garden introduces Clerk sign-in, the plan persists in Neon, returning sign-in restores it, and editing/canceling leave the saved plan untouched until a confirmed replacement succeeds.
  Why now: Establishes the garden identity and revision that the identification flow needs, while proving continuity and data-loss safeguards before attaching plant history.
  PRD ref: `prd.md > Authentication and Garden Saving`, `prd.md > Changing and Replacing a Garden`, `prd.md > Save After Signing In to an Existing Garden`, `prd.md > My Garden`, `prd.md > Garden History and Restoration`.
  Spec ref: `spec.md > Garden Workspace`, `spec.md > Authentication and Replacement Dialog`, `spec.md > My Garden and Identification History`, `spec.md > Data Model`, `spec.md > Application Route Contracts`, `spec.md > Clerk, Neon, and Hosting`.
  Build: Configure Clerk and Prisma/Neon using locally supplied environment values; request only missing setup information when needed, never credentials in chat. Add the two approved models, migrations, and database scripts. Implement plan-receipt verification, same-tab draft/pending-save preservation, owned garden read/save routes, serializable revision-guarded replacement, idempotent plan saving, and the accessible replacement dialog. Preserve visitor drafts when signing into an existing garden. Add My Garden and an honest empty history state. Clear private browser data on sign-out/account changes. Keep restoration errors distinct from no garden.
  Verify (mechanical): Run focused service/RTL tests plus lint/typecheck/build. Against a disposable, guarded TEST_DATABASE_URL, verify unique-user gardens, ownership isolation, transaction rollback preserving seeded history, confirmed replacement clearing it, stale revisions, and duplicate plan saves preserving new history. Do not run destructive tests against runtime/migration databases. Inspect sign-up/sign-in/save/return/sign-out, cancel editing, and visitor-draft sign-in with an existing garden in the browser. Saving/restoration tests use valid signed fixture plans and do not call RapidAPI again.
  Learner check: Generate a plan, sign in through Save Garden, save, sign out, and return. Confirm the same map loads. Edit and cancel; confirm the old garden remains. Generate a new draft and inspect both cancel and confirm replacement. Check that the warning explains history clearing and irreversibility. Confirm a visitor draft survives sign-in to an account that already has a garden.
  Commit: Persistence checkpoint intent: `feat(garden): save and replace one owned garden safely`; provide per-file commands under the manual Git rules.

- [ ] **3. Identify plants and restore trustworthy garden history**
  Becomes usable: From the saved garden, prepare/preview/upload a photo, receive a confident weed or non-weed result, save it automatically, and reopen it from newest-first history. Uncertain results stay out of history; failed saves retry without another identification request.
  Why now: Completes the protecting half of the kernel on the established garden identity. This slice joins the journey and verifies that replacement, retries, and returning sessions cannot mix old and new results.
  PRD ref: `prd.md > Photo Identification`, `prd.md > Identification Confidence Policy`, `prd.md > Confident Non-Weed Results`, `prd.md > Small-Garden Control Guidance`, `prd.md > Garden History and Restoration`, `prd.md > Historical Result`, `prd.md > Responsive Layout and Motion`.
  Spec ref: `spec.md > Photo Preparation and Upload`, `spec.md > Identification Normalizer and Result Card`, `spec.md > Identification Saving and Retry`, `spec.md > My Garden and Identification History`, `spec.md > Weed Identification API`, `spec.md > Focused Verification`, `spec.md > Important Failure Modes`.
  Build: Implement bounded native photo preparation and exact processed preview, independent server format/size checks, temporary multipart forwarding, deterministic confidence/evidence normalization, weed/non-weed result cards, the approved two-sentence whole-item guidance allowlist/fallback, signed result receipts, revision-bound idempotent saves/retries, and owned history/detail routes. Do not expand the allowlist or invent advice. Include processing/loading/uncertainty/API failure/unsaved states and garden-change/session-expiry handling. Finish connected responsive navigation and restrained reduced-motion-safe transitions; document startup and real demo limitations.
  Verify (mechanical): Run the focused suite plus lint/typecheck/build. Verify dandelion/basil normalization from recorded live fixtures and explicitly simulated threshold/invalid/missing evidence, provider errors, rejected advice, receipt tampering/expiry, and save failures. Check 3,000,000-byte boundaries, unsupported/corrupt images, bounded compression, preview/upload equality, and direct oversize rejection. Use the isolated database to verify save idempotency and replacement during analysis/retry. Inspect the complete browser journey at phone/tablet/desktop widths, keyboard use, and reduced motion. Check a justified live application upload only if needed to verify forwarding; do not spend quota on simulated edge cases or automatic retries. Confirm no image storage, raw provider fields, or excluded guidance reaches the UI/history.
  Learner check: From My Garden, upload and replace a photo, inspect the prepared preview, identify a plant, and return to history/details. Confirm score wording, classification, explanation, appropriate guidance or fallback, and returning sign-in restoration. Try the clearly labeled simulated uncertainty/save-failure checks provided during development and confirm no uncertain history entry or duplicate save. Then explore the complete journey on a phone or narrow viewport and report anything confusing or broken.
  Commit: Identification checkpoint intent: `feat(identification): connect plant results to garden history`; provide per-file commands under the manual Git rules.

## Current Checkpoint

Slices 1 and 2 are complete after verification and learner feedback. Slice 3 is implemented and mechanically verified; its checkbox remains open until the learner completes the identification/history review.

- Checks passed: 92 focused tests across 14 Vitest files, seven guarded disposable PostgreSQL integration checks, lint, typecheck, and production build.
- Browser mechanics passed at widths 320/390/768/1440 with keyboard use and reduced motion using a clearly labeled isolated UI harness. Real browser compression reduced an oversized valid JPEG to 269,356 bytes. Simulated uncertainty, failed saves, receipt-only retry, non-weed details, reviewed weed guidance, and history navigation passed without horizontal overflow or page errors.
- No new RapidAPI requests were made during Slice 3 implementation. Recorded live responses and mocked transport checks establish the contract; actual authenticated upload/history restoration still needs the learner check.
- Use the real app at http://localhost:3000 for the authenticated flow and the temporary labeled simulation at http://127.0.0.1:3100 for failure states without quota. The simulation has no real authentication, provider calls, or database persistence.
- No Git mutations were executed. Commit commands are supplied per changed non-ignored file; developer commit confirmation remains separate from verification.

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, review the form, real map, evidence wording, and mobile layout while feedback can shape the remaining interfaces.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3, explore the integrated planning/save/identification/return journey, including replacement and awkward inputs. This session supplies the Final Review feedback below.

In learn mode, also complete each slice's Learner check before advancing. In fast mode, slice 2 is mechanically verified without an extra mandatory hands-on pause; its behavior remains part of the final integrated review. Add a checkpoint only if a discovered issue needs learner feedback.

## Final Review

- [ ] Final review complete — feedback resolved, relevant checks pass, developer commit status is accurately recorded, and learner confirms ready to ship.

Record agreed fixes here as unchecked items after feedback. No findings or completion are assumed. Deployment is optional and is not a prerequisite for the local demo.

## Code Tour and App Map

- [ ] Learning activity complete — trace one actual planning decision through a spec section, implementation, and meaningful test to connect the learner's scoping/PRD/spec goal to working evidence.
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse.

Activity and evidence: Not started; choose a real build example after final revisions.
Route and stops: Not yet established; use actual paths/symbols from the finished implementation.
Edit outcome: Not yet offered; avoid inventing a change solely for this activity.
Reflection: Not yet offered; personal answers belong only in the ignored profile.
Activity mode: Planned focused planning-to-code verification walkthrough; learner may redirect.

## Revisions

- Used the installed Node 24.19.0 runtime rather than installing Node 22; it supports the selected stack and is documented in the spec/startup instructions.
- Added compact numbered zones with a named crop key for very wide beds after browser screenshots exposed clipped labels; rectangular proportions and accessible crop names remain intact.
- Added focused receipt/Route Handler tests and a shared local PlantIcon component to the planned file structure; these support the approved behavior without adding product features.
- Disabled Next.js automatic agent-rule generation after it appended to the existing AGENTS.md; restored the original project instructions without a Git mutation.

- Applied the learner's two Slice 1 refinements: compact map labels at extreme ratios in both directions, and distinct calm styling for strong conflict warnings. Focused regression tests, lint, typecheck, build, and simulated browser presentation checks pass; evidence policy is unchanged.

### Slice 2 verification checkpoint — 2026-10-08

- Implemented Clerk routes/provider, public planning, owned garden/history reads, signed-plan saving, one-garden uniqueness, bounded serializable replacement/retry logic, revision checks, pending visitor draft preservation, replacement confirmation, restoration errors, cancel editing, and private state clearing on sign-out. Identification remains unavailable until Slice 3.
- Applied the additive initial Prisma migration successfully to the configured application Neon database. CLI provider output was withheld. No garden or identification test records were written to the application database.
- Checks passed: 56 focused tests across eight Vitest files, lint, typecheck, and production build. Live browser checks confirmed public mobile planning/validation and real Clerk sign-in/sign-up rendering. No account was created by the assistant.
- The initial checkpoint awaited TEST_DATABASE_URL; the learner has now configured it. Remaining: authenticated sign-in/save/return/replacement browser checks and the learn-mode learner review. Slice 2 remains unchecked; Slice 3 has not started. No Git mutations were executed.
- Next setup: create a regular Neon child branch named `shamba-slice-2-tests` from the application branch, with a distinct compute endpoint and its own direct connection string. Save it as TEST_DATABASE_URL in ignored .env.local; retain runtime/migration URLs for the application. Regular branching preserves migration metadata. Tests apply migrations to the test target and clean only their run’s fixtures.
- Dependency audit currently reports nine high findings in development/tooling chains (ESLint glob dependencies and Prisma CLI dependencies). No force-fix or stack downgrade was applied; dependency remediation remains a release follow-up. This is not a production-readiness claim.

### Slice 2 disposable database verification — 2026-10-08

- Verified TEST_DATABASE_URL is a direct Neon target distinct from both DATABASE_URL and DIRECT_URL, normalizing the pooling suffix before comparison. No connection values were printed, recorded, or committed. The guard now refuses missing application references and pooled test targets.
- Ran the migration and all five PostgreSQL integration tests only against the guarded disposable branch. Confirmed one garden per user, ownership isolation with seeded history, rejection of stale/unconfirmed replacements, rollback preserving old history after an injected update failure, replacement clearing history atomically and increasing revision, idempotent saves preserving newer history, and only one winner among competing replacements.
- The first run exposed transaction acquisition timeouts on initial connections. Increased transaction acquisition and execution deadlines to bounded 10-second values; retained serializable isolation and the existing three-attempt conflict limit. This addresses observed startup latency without weakening replacement safety or adding upstream retries.
- Reverification passed: five real database integration tests, 57 focused tests across eight files, lint, typecheck, and production build. No RapidAPI calls were made. Test cleanup targets only run-specific fixture gardens in the disposable database; a guarded read-only follow-up confirmed zero remaining test fixture gardens.
- Authenticated browser/learner instructions have been presented for save, return, edit/cancel, confirmed replacement, and visitor-draft sign-in to an existing garden. Results are pending; do not infer success from service/RTL tests. Slice 2 stays unchecked until the learner completes the review; Slice 3 has not started.

### Slice 2 learner review and sign-out recovery — 2026-10-08

- The learner completed authenticated save/return, edit/cancel, replacement cancel/confirm, and visitor-draft sign-in to an existing account, reported all behaved as expected, and requested proceeding to Slice 3.
- Fixed the requested failed sign-out recovery before advancing. Private local state is cleared immediately as before; rejected sign-out reloads the authenticated garden through the owned read endpoint and displays retry feedback. Account changes/unmount prevent recovery into the wrong workspace; canceled requests cannot repopulate the cleared draft. Successful sign-out behavior is unchanged.
- Regression verification passed: 58 focused tests, lint, typecheck, and production build. Existing five disposable PostgreSQL checks remain passing; this UI-only fix does not change database transactions. Slice 2 is checked complete; manual Git commands remain the developer’s responsibility.
- Slice 3 has begun under the approved order and learn mode. Keep the two-sentence guidance allowlist and deterministic confidence rule unchanged.

### Slice 3 mechanical verification — 2026-10-08

- Implemented temporary photo preparation/upload, independent server validation, provider normalization, deterministic confidence/evidence checks, weed/non-weed results, automatically saved history, owned details, and signed save-only retries. The reviewed two-sentence guidance allowlist remains unchanged; filtered-out advice produces the approved fallback.
- Revision/ownership checks run before provider analysis and inside persistence transactions. Seven actual PostgreSQL checks passed only against the guarded disposable branch, including idempotent identification saves, stale receipts after replacement, and concurrent identification/replacement preventing old-revision history from remaining in the new garden.
- Final unit/component verification passed: 92 tests across 14 files, ESLint, TypeScript, and production build. Tests cover recorded dandelion/basil responses, explicit uncertainty/failure simulations, evidence/receipt validation, upload boundaries, bounded compression, exact prepared preview/upload, and failed sign-out recovery.
- Isolated browser verification passed at 320/390/768/1440 pixels, with keyboard navigation and reduced motion. A valid oversized JPEG was compressed by the native browser pipeline to 269,356 bytes; result/history navigation and simulated uncertainty/save failure were checked. These are simulated UI checks, not authenticated provider/database end-to-end claims.
- Internal file-structure adjustment: share the conservative guidance policy between server validation and result UI; keep history cards in MyGarden and use HistoricalResult for owned detail retrieval. This preserves the approved behavior without extra product features.
- Awaiting the learner’s real authenticated upload, identification, history/details, and returning-session check. Slice 3, final review, and learning wrap-up remain unchecked.

- Local startup follow-up: Turbopack cold compilation stalled after the passing build. Restarted the development server with `npm run dev -- --webpack`; it reported ready at localhost:3000, but the bounded signed-out route smoke check timed out. Authenticated Slice 3 runtime readiness is therefore still pending learner confirmation. No provider request was made by this check.

### Requested experience refinements — 2026-10-08

- The learner requested modal sign-in and global page-data loading before continuing Slice 3 review. In-app authentication now opens Clerk’s dialog and preserves previews; a shared non-blocking status covers account/data/analysis operations and route suspension. Direct auth routes remain callback fallbacks.
- Added focused regression coverage for modal invocation/draft preservation, concurrent loading cleanup, restoration failures, and retries. Slice 3 remains unchecked pending learner review.

- Refinement verification passed under the supported Node 24 runtime: 95 tests across 15 files, lint, typecheck, and production build. No new provider or database requests were required. Modal invocation is covered with simulated Clerk identity; live dialog interaction remains part of the learner review.

### Centered loader refinement — awaiting developer checks

- Replaced the corner status panel with one centered cream card, a custom sprout illustration, a restrained orbit, and a soft viewport veil. Reduced-motion preferences stop animation; underlying controls remain reachable.
- Removed inline loading spinners/messages and busy button label replacements. Kept busy/disabled semantics and success, uncertainty, and failure feedback. Route fallback joins the shared registry; native replacement dialog receives the same loader through a portal.
- Updated affected regression expectations and added overlapping route/page loader coverage. Per the learner’s instruction, the assistant ran no tests, lint, typecheck, build, installation, or server. Verification and Slice 3 learner review remain pending.

### Shared button height and pending feedback — awaiting developer checks

- Added a shared 48px Button with primary, secondary, outline, and destructive variants. Request actions retain their label/width, show a decorative spinner, and disable repeat clicks. The single global loader remains the source of progress text.
- Migrated application action buttons, aligned responsive action rows, grouped upload controls, and compacted crop selection cards to the shared height. Clerk primary/social form buttons use the same token. Retry buttons remain visible during their request.
- Added focused pending-button and identification regression coverage, and strengthened the existing generation test. No tests, lint, typecheck, build, installation, or server were run by the assistant, as requested. Slice 3 learner review and developer verification remain pending.

### Garden generation progress dialog — awaiting developer checks

- Added an input-aware modal, elapsed time, explicitly estimated wait/bar, playful gardening captions, indeterminate feedback after the estimate, and cancel-with-input-preservation. It replaces the global centered card only while open; button progress remains. No fake provider stages, 100% completion, artificial delay, or automatic retry is introduced.
- Guarded cancellation/retry so a late canceled response or finally block cannot overwrite the draft or unlock a newer request. Added focused timer, single-loader, cancellation, and late-response regression coverage.
- The assistant ran no tests, lint, typecheck, build, installs, server, or provider calls. Developer checks and Slice 3 learner review remain pending.

### Premium flat redesign — awaiting developer checks

- Restyled the complete interface in a flat premium system on the approved palette and Manrope: sticky top bar, hero with orientation cards and a crop-reactive garden illustration, numbered form sections with quick sizes and a live bed outline, illustrated crop tiles, a side-by-side map/explanation plan, history card grid, upload tips with drag-and-drop and prepared-photo size, stamped result badges, flat dialogs/loader, and branded direct auth pages.
- Replaced Motion with GSAP (`gsap`, `@gsap/react`) behind a reduced-motion guard; removed `MotionProvider.tsx`. Server-rendered hero/form use CSS entrances. Behavior, accessible names, honesty wording, and test-visible copy are unchanged; crop tiles intentionally supersede the 48px compact selector refinement.
- The assistant ran no installs, tests, lint, typecheck, build, server, or provider calls. Run `npm install` before verification so the lockfile records GSAP and drops Motion. Developer checks and Slice 3 learner review remain pending.
- Follow-up from the learner: Manrope stays the only typeface. Fixed the redesign's font token, which resolved on `:root` before the `next/font` variable existed (it was set on `<body>`), letting browsers fall back to their default font; the variable now sits on `<html>`. Reduced shared button labels to 14px with 16px icons; the Generate Garden Plan button no longer enlarges its label. Not yet verified by the assistant.

### Calm, minimal layout and loading — awaiting developer checks

- Learner feedback: layouts felt crowded, text and buttons too large and misaligned, loading appeared at awkward times, and a loading card appeared over an open dialog. Moved every view into one aligned 760px column, reduced heading/button sizes (44px and 36px), added one-sentence next-step guidance per screen, and removed the hero illustration (`GardenScene`) and generation captions.
- Replaced the centered loading card with a delayed, non-blocking status pill; inside the replacement dialog it renders as an inline row. History loads inside its section with placeholders instead of a page-level status. Pending buttons swap their icon for a spinner to keep width. Accessible names, roles, honesty copy, and test-visible text are preserved.
- The assistant ran no installs, tests, lint, typecheck, build, server, or provider calls. Developer checks and Slice 3 learner review remain pending.
