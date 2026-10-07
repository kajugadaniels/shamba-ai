---
doc: checklist
status: approved
---

# Shamba AI — Build Checklist

Build mode: learn — pause after each mechanically verified slice for the learner check and a brief explanation of important implementation decisions. Keep final learner review and feedback.

The scope, PRD, and technical specification are approved. The learner approved this build order without reordering or merging slices. Slice 1 is complete; Slice 2 is next, pending local Clerk/Neon configuration. Each slice delivers usable behavior across the necessary layers. Styling, responsive behavior, error handling, and verification are part of each slice rather than deferred plumbing tasks.

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

- [ ] **2. Save, restore, and safely replace one garden**
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

Slice 1 is complete. The learner reported that the planning flow looked good and conditionally approved completion after two requested refinements; both are implemented and verified. Slice 2 is next. Its required Clerk and Neon settings are currently absent from ignored .env.local; setup has been requested without asking for credential values in chat.

- Checks passed: 42 tests across five Vitest files, ESLint, TypeScript, and production build on Node 24.19.0 / Next.js 16.4.0.
- Browser checks passed: inline validation, preview/change preserving inputs, widths 320/390/768/1440, reduced motion, extreme garden proportions, and no page errors. Both landscape and portrait extreme ratios use the numbered crop key. Strong conflicts now have a distinct calm warning outline and badge; ordinary advisories retain softer amber styling.
- Live integration: one companion request through the running app, HTTP 200, 1.5m × 2.5m tomato/basil guide; no automatic retries or weed calls. Sanitized observations are in the existing API request ledger and verification notes. Mocked edge-case checks consume no quota.
- Local app is running at http://localhost:3000. Save Garden is explicitly unavailable in Slice 1; it does not imply persistence.
- Learner feedback: received and resolved; the learner authorized completion after these checks passed. The working tree was clean before refinements, confirming the preceding checkpoint had no uncommitted changes. Refinement commits remain developer actions; exact per-file commands are supplied and no assistant Git mutations occur.

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
