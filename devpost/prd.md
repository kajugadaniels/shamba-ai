---
doc: prd
status: approved
---

# Shamba AI — Product Requirements

A calm, beginner-friendly copilot for planning and protecting one small outdoor food garden.
Source: `scope.md > The Unique Kernel`, `Who It's For`, and `The POC Boundary`.

## The Core Journey

1. A visitor opens Shamba AI and enters garden width and length, then selects two to four supported crops.
2. They generate a plan without an account and see a labeled top-down garden map with short companion explanations.
3. They choose Save Garden, sign up or sign in if needed, and save their one garden.
4. From the saved garden, they select one JPG, PNG, or WEBP unwanted-plant photo. If it exceeds 3 MB, the browser resizes/compresses it locally. They preview the exact prepared file, upload it only when it is at most 3 MB, and request identification.
5. A confident result shows common name, scientific name if available, Weed or Not a weed classification, confidence under the final policy, API-grounded explanation, and date/time. Weed results show only applicable filtered control guidance; non-weeds show a classification message without control sections. Both are automatically saved to that garden's history.
6. They return to My Garden to see the map and newest-first history. Returning after signing in restores these saved results.

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout

### Garden Planning Form

- Introduction: **Shamba AI** and **Plan a small food garden that works better together.**
- One planning section, ordered as Garden size, Choose what you want to grow, and Generate Garden Plan.
- Width and length number inputs labeled in meters; adjacent on wider screens, stacked on narrow screens.
- Tomato, Carrot, Onion, and Basil as selectable cards or chips, each with a name and simple plant icon or image. Multiple selection is supported and visibly indicated.
- Inline validation near the relevant input. No dashboard, sidebar, or onboarding steps before planning.

### Garden Plan Preview

- **Your Garden Plan**, with dimensions and selected-crop count; selected crop names also remain visible.
- A top-down rectangular map preserving the garden's proportions, divided into clearly labeled crop zones or rows.
- A short **Why this layout works** section below the map.
- **Save Garden** and **Change Garden** actions.
- The preview is distinct from a saved garden and does not change saved data.

### My Garden

- **My Garden**, with dimensions and crop names, for example **3m × 4m · Tomato, Carrot, Onion, Basil**.
- The saved map and companion explanations, preserving the plan that was saved.
- Primary actions: **Identify an unwanted plant**, **Change Garden**, and **Sign out**.
- **Identification History** below the plan, newest first. Each card shows plant name, a clear **Weed** or **Not a weed** classification, confidence under the final policy, date/time, a one-line summary, and **View details**.
- Empty history explains that confidently identified plants will appear after the first successful identification is saved, whether or not classified as weeds.
- Returning sign-in opens this view when a saved garden exists.

### Plant Upload and Current Result

- **Identify an unwanted plant**, with visible context identifying the saved garden.
- Instruction: **Upload a clear photo showing the plant, especially its leaves and as much of the whole plant as possible.**
- One-photo selection, local preparation when needed, preview of the exact prepared file, removal/replacement, and **Identify Plant** action. Show preparation progress and prevent analysis until the file is ready.
- A distinct analysis loading state followed by a result, uncertainty message, or failure message.
- A successful result is an informative plant card: prominent common name, scientific name if available, **Weed** or **Not a weed** classification, confidence under the final policy, date/time, API-grounded explanation, and saved-garden context. Only weed results can show applicable filtered control guidance.
- The current photo can remain visible during this result; permanent photo storage is not required.
- Actions after a successful identification: **Identify another plant** and **Back to my garden**.

### Historical Result

- A focused view with common name, scientific name if available, classification, confidence under the final policy, date/time, and API-grounded explanation. Weed results show saved applicable control guidance; non-weeds show the same classification message as the current result and no empty control sections.
- A clear return action to **My Garden**. No historical photo is required.

Source for these surfaces: `scope.md > The Core Loop`, `The POC Boundary`, and `Questions for the Next Planning Steps`.

## Look and Feel

- Modern, calm, natural, warm, professional, and beginner-friendly; visual rather than text-heavy.
- Deep forest green around `#1F4D3A` for brand/primary actions; leaf green around `#6F9E55` for selection, positive states, and map highlights.
- Cream background around `#F7F5EE`, charcoal-green text around `#202A25`, small soil-brown accents around `#8A6746`, and neutral light gray/green borders.
- Use accessible warning and error colors rather than forcing those states into green. Color alone must not communicate crop identity or state.
- Manrope or a similar clean modern sans-serif; strong, friendly headings and readable body text. No decorative or handwritten typography.
- Spacious layouts, rounded controls/cards, simple plant illustrations/icons, and subtle borders. The premium flat redesign (below) replaces shadows with solid color blocks and borders.
- The map is the visual focus: a simplified garden bed with separated zones and explicit crop labels.

Source: `scope.md > Inspiration & Identity`, refined by the learner during PRD discovery.

## Features and Behavior

### Input Validation

- Width and length must each be between **1m and 5m inclusive**. Decimal values such as 1.5 and 2.5 are allowed.
- Require two to four crops from the supported set. Fewer than two produces an explanation that companion planting needs at least two crops.
- Missing, invalid, or out-of-range dimensions produce inline messages and prevent plan generation.
- Preserve entered dimensions and selections when validation fails.

Acceptance: valid dimensions and two to four crops generate a preview; invalid values or fewer than two crops produce visible inline messages and no new plan.

### Companion-Planting Layout

- Show where the selected crops should be placed near each other using labeled zones/rows, names, and icons/images.
- Explain important supported companion relationships in plain language. The learner's Tomato + Basil and Carrot + Onion examples require planting-data verification before being presented as factual guidance.
- Present conflict warnings and advisories according to Companion Conflict Evidence below, preserving their evidence strength in the map and explanation.
- Do not promise exact centimeter spacing or planting capacity unless reliable planting data supports it.
- When a supported capacity check finds insufficient space, show **Your selected crops need more growing space.** Suggest increasing dimensions or removing crops, retaining the inputs for adjustment. Do not generate an overcrowded map.
- If reliable capacity data is unavailable, describe the map as a **companion-placement guide**, without claiming exact planting capacity.
- Show clear generation progress. A generation failure leaves the inputs available and gives a retry message.

Acceptance: the map reflects the submitted dimensions and selected crops, labels every selected crop, and provides supported explanations. It does not silently omit crops or invent spacing/capacity rules.

Source: `scope.md > The Unique Kernel` and `The POC Boundary`.

### Companion Conflict Evidence

- Structured `knownConflicts` with `evidence: strong` produce a clear separation warning, labeled **Provider code-checked conflict**. This describes the provider's evidence category, not independent verification by Shamba AI.
- Structured conflicts with `evidence: traditional` produce softer advisory guidance. Generated `badPairs` also produce advisories, never proven incompatibility claims.
- Advisory copy can say **Some gardening guidance suggests keeping these crops apart.** or **The provider recommends separating these crops, but this is not presented as a strongly verified conflict.**
- Do not say **must not be planted together** for traditional or generated advisories. Represent strong conflicts with separation; try to separate advisory pairs when practical without suggesting a verified separation distance.
- If generated pair guidance contradicts structured conflicts, prioritize the stronger structured conflict evidence. Do not display contradictory messages for the same crop pair.
- Translate provider fields into beginner-friendly copy. Never show technical field names in product views.

Acceptance: strong structured conflicts show a distinct separation warning; traditional and generated conflicts show advisory wording. Their differences survive saving/restoration, and contradictions resolve in favor of stronger structured evidence.

Source: learner decision after reviewing the authenticated companion responses.

### Authentication and Garden Saving

- Visitors generate plans immediately. Authentication is required for saving, not initial planning.
- Minimal sign up, sign in, and sign out. No additional account features.
- Save dimensions, crop selections, and generated layout for the authenticated user's one garden.
- Preserve the generated plan through the sign-in/sign-up flow so it can become the saved garden.
- Show save progress and clear success. A save failure leaves the plan visible with a retry option; it must not imply successful persistence.
- Signing in on return restores the saved garden and its identification history. A user without a saved garden can use the planning form.
- Signing out ends access to saved data until sign-in. A different user must not see the previous user's saved garden or history.

Acceptance: a visitor can generate before authentication, then authenticate and save; a returning user sees the saved layout and history, and sign-out removes access to them.

Source: `scope.md > The Core Loop` and `The POC Boundary`.

### Changing and Replacing a Garden

- Change Garden preloads the current dimensions and selected crops into the form.
- Editing and generation create a draft/preview; saved data and history remain unchanged.
- Provide a way to cancel editing and return to the saved garden. Leaving without saving does not replace it.
- Saving a replacement requires confirmation explaining that the existing plan will be replaced, its identification history will be cleared, and this cannot be undone in the proof of concept.
- Canceling confirmation preserves the saved garden and its history.
- Only a successful confirmed replacement makes the new plan the saved garden, with empty history. A failed save must leave the old garden and history intact.

Acceptance: editing and canceling preserve the original plan/history. Confirmed successful replacement displays the new plan and empty history; a failed replacement preserves the original saved data.

Source: `scope.md > Questions for the Next Planning Steps` and `The POC Boundary`.

### Photo Identification

- Start from a saved garden. The user selects one photo and can remove or replace it before analysis.
- Identify Plant starts analysis only with a usable photo selected. Show clear progress without duplicate submissions.
- Accept arbitrary unwanted-plant subjects rather than a fixed supported-weed list. Source formats are JPG, PNG, and WEBP only; HEIC conversion and additional formats are excluded.
- Use valid supported files of **3,000,000 bytes or smaller** unchanged. For larger supported images, resize/compress in the browser while preserving enough visual detail for identification. Keep this a small local preparation feature, with no permanent image storage or separate service.
- The prepared upload must be **3,000,000 bytes or smaller**. Preview that exact file, and send the same bytes for analysis. The server independently checks format and size before forwarding.
- If decoding/preparation fails or reasonable compression cannot meet the limit, show a clear message asking for a smaller or clearer photo. Do not upload the oversized original or keep shrinking until the image becomes unsuitable.
- Unsupported/unusable files show a clear message allowing another selection without losing the saved garden.
- Present a plant name as an identification only when every condition in Identification Confidence Policy below is satisfied.
- A confident result includes common name, scientific name if available, classification, confidence under the final policy, date/time, and visible garden association. Build its short explanation only from API identification features and plant information. Non-weed and control-guidance behavior is specified below.
- Do not invent a confidence value if none is supplied.
- Automatically save confident weed and non-weed results to the same garden's history; no separate Save result action. `isWeed: false` is a classification, not an uncertainty or failure condition.
- Uncertainty shows **We couldn't confidently identify this plant.**, clear-photo tips, and **Try another photo**. Do not save uncertain results to history.
- Complete API failure shows a retry message and adds nothing to history.
- If identification succeeds but history saving fails, keep the result visible, clearly state **The identification was not saved**, and offer a save retry. A retry must not create duplicate history entries.

Acceptance: confident weed and non-weed results each appear once in history with their classification; uncertain/API-failed requests add nothing. A history-save failure shows the result with an unsaved notice, and successful retry adds it once.

Upload acceptance: supported files at or below 3 MB pass through unchanged; larger supported sources are processed locally and only files at or below 3 MB can upload. Preview and analysis use the same prepared image. Unsupported, unprocessable, and still-oversized images produce actionable messages. Direct oversized requests are also rejected by the server.

Source: `scope.md > What "Working" Looks Like` and `The POC Boundary`.

### Identification Confidence Policy

- Accept a confident identification only if a valid common or scientific name is present, `result.isWeed` is an actual boolean, and `result.confidence` is a finite numeric value in the inclusive range 0–100 with a value of at least **90**.
- Also require usable identification features or plant information sufficient to explain the result without inventing content. If only a scientific name is available, use it as the displayed name; do not invent a common name.
- Do not coerce numeric strings or truthy values into valid evidence. Do not substitute `result.overallConfidence` when identification confidence is missing or invalid.
- If any condition fails, show the uncertain-identification state, offer another clearer photo, and save nothing to history.
- Display confident results as **Provider confidence: 98/100** (using the actual score), including in history/details. Never describe the score as a probability of correctness.
- The threshold is a conservative Shamba AI application rule for this proof of concept, not a provider accuracy guarantee. Use one deterministic rule without additional confidence bands; later testing may justify a future change.

Acceptance: score 90 with valid name, boolean classification, and usable evidence passes; score below 90, out-of-range, non-finite, missing, or string confidence fails. Missing/invalid names, classification, or usable explanatory evidence fail even with a high score. A valid overallConfidence cannot rescue invalid identification confidence. Passing weed/non-weed results save and show the provider-score label; uncertain results do not save.

Source: `scope.md > The POC Boundary`, refined by the learner after live API verification.

### Confident Non-Weed Results

- A confidently identified plant with API `isWeed: false` is a successful identification.
- Show its common name, scientific name if available, confidence under the final policy, API-grounded explanation, date/time, and a clear **Not a weed** status. Supporting copy can say **Not classified as a weed**.
- Show: **Shamba AI identified this plant, but the service does not classify it as a weed, so no weed-control guidance is shown.**
- Hide all weed-control sections, including empty ones. Do not invent removal or herbicide advice, even if other API content suggests control actions.
- Automatically save it and restore the same classification/fields in history and details.

Acceptance: the live basil example is displayed as **Not a weed**, remains a successful identification, and can be restored from history without a control section. Uncertain plant identifications still do not enter history.

Source: `scope.md > The Core Loop` and `The POC Boundary`, refined by the learner after live API verification.

### Small-Garden Control Guidance

- Only expose advice that can be safely mapped to a small mixed food garden. An API field or category alone does not establish suitability.
- Exclude chemical/herbicide advice, flame treatments, concentrated-acid treatments, grazing, and broad field-management advice from current results, historical cards, and details.
- Define the mapping/filtering policy in the technical specification. Unrecognized, ambiguous, or unsuitable advice must not pass through merely because the API returned it.
- Do not invent replacement advice. If no applicable guidance remains, clearly state that no suitable control guidance was provided rather than displaying empty sections.
- Non-weeds never show weed-control guidance. Identification success is independent of whether applicable control advice is available.

Acceptance: excluded advice in the live dandelion fixture never appears in product views; any shown advice is appropriate to the agreed small-garden mapping. A non-weed result shows only its classification message.

Source: `scope.md > Who It's For` and `The POC Boundary`, refined by the learner after live API verification.

### Garden History and Restoration

- Store each successful identification's common name, scientific name if available, classification, confidence under the final policy, API-grounded explanation, applicable filtered control guidance for weeds only, and date/time with its garden. Store non-weed results without fabricated control content.
- Display newest first, with readable summary cards and a details action.
- Historical details reproduce saved information without requiring stored photos.
- Keep the saved garden view usable while history loads; distinguish loading, no history, and failure to load. A load failure must not appear as an empty history and should allow retry.
- Failed garden restoration shows a retry message rather than silently replacing saved data with an empty/new garden.

Acceptance: returning sign-in restores the saved plan and newest-first results; opening details shows the saved fields. Empty history and retrieval failure are visibly different.

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

### Responsive Layout and Motion

- Support phones, tablets, laptops, and large desktops by rearranging components, rather than simply shrinking the desktop view.
- Inputs stack on narrow phones; crop cards wrap; history cards use available width. Account/navigation controls adapt to small screens.
- Preserve rectangular map proportions with readable labels. Avoid horizontal page scrolling and keep text readable and buttons easy to tap outdoors.
- Fast, restrained feedback for crop selection, controls, generated-map appearance, analysis/generation loading, result entry, state changes, and newly saved history items.
- Motion must not delay actions or obscure information. Respect reduced-motion preferences; essential progress and results remain understandable without animation.

Acceptance: the complete journey works on narrow mobile and wider tablet/desktop screens without horizontal page scrolling or unreadable maps. Reduced-motion mode preserves all actions and state information.

## States and Boundaries

- **Visitor:** no account required for generation; saving introduces authentication.
- **Draft:** visible generated plan is not saved until saving succeeds. Editing does not alter saved data.
- **Saved garden:** one per authenticated user, restored on return; identification operates on that garden.
- **Replacement:** confirmed saving replaces the plan and clears its old history together.
- **Current photo:** usable during upload/result display; permanent storage and historical display are not required.
- **History:** contains successfully saved confident weed and non-weed identifications with explicit classification; uncertainty is excluded.
- **Authentication interruption:** failed/canceled sign-in must not imply saving succeeded; keep the generated draft available for retry.
- **Sign-out:** saved data remains stored but is inaccessible in the signed-out experience.
- **Loading/error:** distinguish progress, uncertainty, API failure, persistence failure, and empty data with clear text and actions.

## Product Decisions

- Immediate planning before authentication preserves a low-friction first experience.
- One saved garden provides continuity without multiple-garden management.
- Explicit replacement confirmation and history clearing prevent mixing old and new garden data.
- Automatic history saving removes an extra user action; uncertain identification does not become a reliable history record.
- Confident non-weeds count as successful identifications and are saved with **Not a weed** status, making history a record of identified plants rather than only removal targets.
- Control guidance is restricted to advice suitable for the small mixed food garden; unsuitable API content is excluded rather than displayed automatically.
- Result-only persistence avoids photo-library complexity.
- A placement guide is acceptable when planting data cannot justify exact capacity claims.
- Mobile use outdoors is important; readable responsive layouts and restrained motion support this context.

## What We're Building

The planning form, generated-map preview, minimal authentication/save flow, saved-garden view, safe replacement flow, photo identification, automatically saved confident results, newest-first history/details, responsive layouts, and accessible state/motion behavior described above.

## Non-Goals

Source: `scope.md > Explicitly Cut` and `Later`.

- Roles, organizations, profile management, or admin features; authentication only supports saving/restoration.
- Multiple gardens, permanent photo-library management, or version history/undo for replacement.
- Crops beyond tomato, carrot, onion, and basil.
- Weather, watering reminders, climate/location recommendations, disease diagnosis, marketplace features, or full farm management.
- Balconies, containers, hydroponics, greenhouses, or commercial farms.
- Unsupported exact spacing, capacity claims, or forced identifications.
- Chemical, flame, concentrated-acid, grazing, and broad field-management control recommendations.
- HEIC conversion, additional photo formats, permanent image storage, or a separate image-processing service.

No later-release features are committed. Deployment remains optional; required submission artifacts are a short demo video and public GitHub repository.

## Confirmed Save Behavior and Technical Investigations

### Save After Signing In to an Existing Garden

**Confirmed by the learner:** if a visitor generates a draft and chooses Save Garden, then signs in to an account that already has a garden, preserve that draft and show the same replacement confirmation. Do not silently overwrite the existing garden or discard the visitor's draft. Normal returning sign-in (without a pending save) opens My Garden.

### Technical-Spec Investigations

- Verify companion relationships and whether reliable fit data exists. Resolve the map's capacity claims before spec approval; the placement-guide fallback is already agreed.
- The selected identification API's live checks returned confident weed and non-weed results. Implement the agreed Identification Confidence Policy and define usable explanatory evidence using only identification features/plant information. Implement the agreed non-weed/history behavior and a small-garden-only control mapping; confidence calibration and provider uncertainty/failure behavior remain unverified.
- The learner selected Clerk authentication, Neon PostgreSQL, and Prisma within a Next.js App Router/TypeScript application. Use server-side RapidAPI integrations and Zod normalization; the technical specification defines their contracts and persistence behavior.
- Implement the agreed JPG/PNG/WEBP browser preparation and 3 MB client/server limit. Define bounded compression settings, date/time presentation, and handling of session expiry or garden replacement during an in-flight identification so results cannot attach to the wrong garden.

These investigations belong in the technical specification; they do not authorize additional product features.

### Approved experience refinement

Sign in, Save Garden authentication, and session-recovery sign-in open a dialog over the current experience. Preserve drafts before authentication; closing the dialog leaves the current preview available. Existing replacement confirmation remains required after signing into an account with a saved garden. Direct authentication routes remain available for external callbacks.

A shared, non-blocking loading status appears during account readiness, garden restoration/generation/saving, history/details retrieval, photo preparation, and identification/save retries. The centered sprout loading card is the single progress message; remove repeated inline loading copy while retaining disabled controls, busy semantics, and outcome messages. Shared action buttons show a decorative spinner while their own request is pending, without repeating the global loading message. Concurrent requests keep the status visible until all finish; cancellation and failure clear it. Respect reduced motion and keep retry controls usable.

### Shared button refinement

Use a consistent 48px button height across the application, including compact crop selectors. Action buttons share primary, secondary, outline, and destructive variants; width can vary. Keep labels and widths stable during requests, show an in-button spinner, disable repeat clicks, and respect reduced motion. Align action groups with consistent gaps and stack them on narrow screens.

### Garden generation waiting experience

After valid Generate Garden Plan submission, show a dedicated modal with the chosen garden dimensions/crops, elapsed seconds, a clearly labeled 20–40 second wait estimate, and playful gardening captions. The progress bar represents elapsed estimated waiting, not provider-reported stages or completion. At 40 seconds, switch to indeterminate “Still waiting” feedback; longer waits explain that the user may continue or cancel. Never claim 100% completion before a valid response.

Cancel generation preserves inputs and ignores any late result. The dialog closes immediately on success, failure, or cancellation; no artificial minimum wait or automatic retry is added. Keep the button’s pending spinner, suppress the centered global card while this dialog is open, and respect reduced motion.

### Premium flat redesign

The learner requested a complete, premium, user-friendly interface in a flat style with animation, permitting GSAP or Three.js. Keep the approved palette, Manrope, journey, wording, and evidence policies; restyle every surface with solid color blocks, crisp borders, and no drop shadows, gradients, or blur.

- The planning view pairs the headline with three short orientation cards and an illustrated garden bed on wider screens; on phones the form follows the headline directly, with no onboarding gate. Selected crops visibly grow in the illustration while unselected crops rest as seedlings.
- The form adds numbered sections, three quick size presets, a live bed-shape outline that follows the entered dimensions, and larger illustrated crop tiles. The tiles intentionally replace the earlier 48px compact crop selectors; action buttons keep the shared 48px height.
- The plan places the map beside its explanations and actions on wide screens. History uses a responsive card grid. Upload offers photo tips, drag-and-drop, the prepared-photo size, and a scanning line during analysis. Direct sign-in/sign-up routes use a branded split layout.
- Motion uses GSAP for the map planting sequence, view entrances, crop selection feedback, history and result reveals, and the ambient illustration. Motion never delays actions; reduced-motion preferences remove it while keeping every state readable. Three.js is not used: a WebGL scene conflicts with flat styling and adds weight for outdoor phone use.
