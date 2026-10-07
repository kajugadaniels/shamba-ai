---
doc: scope
status: approved
---

# Shamba AI

A small-space garden copilot that helps beginners plan and protect one small food garden.

## The Unique Kernel
Help a beginner decide “what belongs in their garden and what does not”: a companion-planting layout for chosen crops, followed by identification and control guidance for an unwanted plant in that same garden.

## Who It's For
A beginner growing food in a small outdoor home garden or raised bed, such as a rectangular backyard plot in an urban or suburban area. They need help choosing which crops to grow together and understanding an unfamiliar plant they find after planting. Their current tools or workarounds have not been established.

## The Core Loop
Enter the rectangular garden's dimensions in meters, choose a few supported crops, and receive a simple layout showing which crops should be planted together. Later, upload an unwanted-plant photo from that garden and receive an identification with practical control guidance, or a clear explanation that identification is uncertain.

Visitors can generate a plan without signing in. Choosing to save requires sign up or sign in and associates the garden with that user. On return, signing in restores their one saved garden and its identification history. They can update or replace the garden; signing out ends access to saved data until they sign in again.

## Inspiration & Identity
Beginner-friendly, with a clear layout and plain, practical guidance. No visual references or aesthetic direction chosen yet; refine these in the PRD.

## Why This Matters to the Learner
Practice “turning an idea into a small, well-scoped product before writing code”: decide what belongs in the MVP, leave other ideas out, and translate scope into a useful PRD and technical specification.

## What "Working" Looks Like
A beginner enters a garden size such as 2m × 3m or 3m × 4m and selects crops. They receive a clear companion-planting layout, then upload an unwanted-plant photo and receive a plant name, confidence level if available, short explanation, and practical control guidance when identification is strong enough.

If identification is uncertain, the app says “We couldn't confidently identify this plant” and suggests a clearer photo showing the leaves and whole plant, rather than guessing. Validate the flow with a small number of known weed photos without claiming that only those weeds are supported.

A confidently identified non-weed is also a successful identification and enters history with a clear Not a weed classification, scientific name if available, and API-grounded explanation. It shows no weed-control sections or invented removal advice. For weeds, show only control guidance suitable for a small mixed food garden; exclude chemical, flame, concentrated-acid, grazing, and broad field-management advice.

The demo proves both useful results are connected to the same garden and that signing in restores the saved dimensions, selected crops, generated layout, and identification history. Each saved identification includes the common name, scientific name if available, Weed or Not a weed classification, confidence under the final policy, API-grounded explanation, and date/time. Applicable filtered control guidance is shown for weeds only.

Keep the journey concise enough for a short demo; the hackathon targets 2–4 hours of active work and requires a short demo video and public GitHub repository. Deployment is optional. Authentication and persistence make this target tighter; avoid adding account or garden-management features beyond the boundary below.

## The POC Boundary
- One rectangular outdoor home garden or raised bed, measured in meters.
- Four supported crops: tomato, carrot, onion, and basil.
- A simple companion-planting layout and explanation of which selected crops grow well together.
- Upload any unwanted-plant photo and attempt identification through an API; acceptance of a photo does not guarantee identification.
- Present an identification only when the result is strong enough, with confidence under the final policy, a short API-grounded explanation, classification, and practical small-garden control guidance for weeds only.
- Provide a clear uncertain-identification result and better-photo guidance.
- Keep planning and unwanted-plant identification within the same garden journey.
- Minimal sign up, sign in, and sign out using a managed authentication service; Clerk is a candidate for the technical specification.
- Require authentication to save a garden, while keeping initial plan generation available to visitors.
- One saved garden per authenticated user, with updates or replacement and restoration on return.
- Save garden dimensions, selected crops, generated layout, and that garden's confident weed/non-weed identification results with classification and date/time. Uncertain identifications are excluded.
- Identification-result persistence is sufficient; storing uploaded photos is not required for this proof of concept.

## Later
No additional features committed for a later release. Supporting crops beyond the initial four is outside this proof of concept.

## Explicitly Cut
- Roles, organizations, profile management, and admin features: outside the minimal authentication needed to save and restore a garden.
- Multiple-garden management: each authenticated user has only one saved garden.
- Photo-library management: saving identification results is enough to prove continuity.
- Weather, watering reminders, and climate- or location-specific growing recommendations: outside the selected planting and identification proof.
- Disease detection: a separate diagnosis flow.
- Marketplace features and full farm management: beyond the small-garden focus.
- Balconies, hydroponics, greenhouses, containers, and commercial farms: excluded to keep growing-space support limited to a rectangular outdoor plot or raised bed.

## Questions for the Next Planning Steps
The PRD will define layout detail, save/sign-in behavior, garden updates and replacement (including treatment of existing history), and identification-result behavior. The technical specification will select managed authentication, persistence, and the identification API, and define how its result supports an identification decision. These implementation choices are not settled by this scope.
