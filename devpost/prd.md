---
doc: prd
status: draft
---

# Shamba AI — Product Requirements

A calm, beginner-friendly copilot for planning and protecting one small outdoor food garden.
Source: `scope.md > The Unique Kernel`, `Who It's For`, and `The POC Boundary`.

## The Core Journey

1. A visitor opens Shamba AI and enters garden width and length, then selects two to four supported crops.
2. They generate a plan without an account and see a labeled top-down garden map with short companion explanations.
3. They choose Save Garden, sign up or sign in if needed, and save their one garden.
4. From the saved garden, they upload one unwanted-plant photo, preview it, and request identification.
5. A confident result shows the plant name, confidence if supplied, explanation, practical control guidance, and date/time. It is automatically saved to that garden's history.
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
- **Identification History** below the plan, newest first. Each card shows plant name, confidence if available, date/time, a one-line summary, and **View details**.
- Empty history explains that identified weeds will appear after the first successful identification is saved.
- Returning sign-in opens this view when a saved garden exists.

### Plant Upload and Current Result

- **Identify an unwanted plant**, with visible context identifying the saved garden.
- Instruction: **Upload a clear photo showing the plant, especially its leaves and as much of the whole plant as possible.**
- One-photo upload, preview, removal/replacement, and **Identify Plant** action.
- A distinct analysis loading state followed by a result, uncertainty message, or failure message.
- A successful result is an informative plant card: prominent name, optional confidence, date/time, explanation, separate control guidance, and saved-garden context.
- The current photo can remain visible during this result; permanent photo storage is not required.
- Actions after a successful identification: **Identify another plant** and **Back to my garden**.

### Historical Result

- A focused view with name, optional confidence, date/time, explanation, and control guidance.
- A clear return action to **My Garden**. No historical photo is required.

Source for these surfaces: `scope.md > The Core Loop`, `The POC Boundary`, and `Questions for the Next Planning Steps`.

## Look and Feel

- Modern, calm, natural, warm, professional, and beginner-friendly; visual rather than text-heavy.
- Deep forest green around `#1F4D3A` for brand/primary actions; leaf green around `#6F9E55` for selection, positive states, and map highlights.
- Cream background around `#F7F5EE`, charcoal-green text around `#202A25`, small soil-brown accents around `#8A6746`, and neutral light gray/green borders.
- Use accessible warning and error colors rather than forcing those states into green. Color alone must not communicate crop identity or state.
- Manrope or a similar clean modern sans-serif; strong, friendly headings and readable body text. No decorative or handwritten typography.
- Spacious layouts, rounded controls/cards, simple plant illustrations/icons, and subtle borders/shadows.
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
- If supported data identifies incompatible selected crops, show a clear warning and represent separation in the map.
- Do not promise exact centimeter spacing or planting capacity unless reliable planting data supports it.
- When a supported capacity check finds insufficient space, show **Your selected crops need more growing space.** Suggest increasing dimensions or removing crops, retaining the inputs for adjustment. Do not generate an overcrowded map.
- If reliable capacity data is unavailable, describe the map as a **companion-placement guide**, without claiming exact planting capacity.
- Show clear generation progress. A generation failure leaves the inputs available and gives a retry message.

Acceptance: the map reflects the submitted dimensions and selected crops, labels every selected crop, and provides supported explanations. It does not silently omit crops or invent spacing/capacity rules.

Source: `scope.md > The Unique Kernel` and `The POC Boundary`.

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
- Accept arbitrary unwanted-plant subjects rather than a fixed supported-weed list, subject to supported file formats and size limits to be defined in the technical spec.
- Unsupported/unusable files show a clear message allowing another selection without losing the saved garden.
- Present a plant name as an identification only when the API evidence is strong enough under the technical spec's decision policy.
- A confident result includes name, confidence if available, short explanation, practical control guidance, date/time, and visible garden association.
- Do not invent a confidence value if none is supplied.
- Automatically save confident results to the same garden's history; no separate Save result action.
- Uncertainty shows **We couldn't confidently identify this plant.**, clear-photo tips, and **Try another photo**. Do not save uncertain results to history.
- Complete API failure shows a retry message and adds nothing to history.
- If identification succeeds but history saving fails, keep the result visible, clearly state **The identification was not saved**, and offer a save retry. A retry must not create duplicate history entries.

Acceptance: confident saved results appear once in history; uncertain/API-failed requests add nothing. A history-save failure shows the result with an unsaved notice, and successful retry adds it once.

Source: `scope.md > What "Working" Looks Like` and `The POC Boundary`.

### Garden History and Restoration

- Store each successful identification's name, optional confidence, explanation, control guidance, and date/time with its garden.
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
- **History:** contains successfully saved confident identifications only.
- **Authentication interruption:** failed/canceled sign-in must not imply saving succeeded; keep the generated draft available for retry.
- **Sign-out:** saved data remains stored but is inaccessible in the signed-out experience.
- **Loading/error:** distinguish progress, uncertainty, API failure, persistence failure, and empty data with clear text and actions.

## Product Decisions

- Immediate planning before authentication preserves a low-friction first experience.
- One saved garden provides continuity without multiple-garden management.
- Explicit replacement confirmation and history clearing prevent mixing old and new garden data.
- Automatic history saving removes an extra user action; uncertain identification does not become a reliable history record.
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

No later-release features are committed. Deployment remains optional; required submission artifacts are a short demo video and public GitHub repository.

## Open Questions and Proposed Behavior

### Save After Signing In to an Existing Garden

**Proposed behavior; requires learner confirmation before PRD approval:** if a visitor generates a draft and chooses Save Garden, then signs in to an account that already has a garden, preserve that draft and show the same replacement confirmation. Do not silently overwrite the existing garden or discard the visitor's draft. Normal returning sign-in (without a pending save) opens My Garden.

### Technical-Spec Investigations

- Verify companion relationships and whether reliable fit data exists. Resolve the map's capacity claims before spec approval; the placement-guide fallback is already agreed.
- Select identification API and define sufficient evidence for confident identification, including behavior when confidence is absent. Define how explanation and control guidance are obtained reliably.
- Choose managed authentication and persistence; Clerk is a candidate, not a settled stack decision.
- Define supported upload formats and size limits, how dates/times are presented, and handling of session expiry or garden replacement during an in-flight identification so results cannot attach to the wrong garden.

These investigations belong in the technical specification; they do not authorize additional product features.
