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

## Inspiration & Identity
Beginner-friendly, with a clear layout and plain, practical guidance. No visual references or aesthetic direction chosen yet; refine these in the PRD.

## Why This Matters to the Learner
Practice “turning an idea into a small, well-scoped product before writing code”: decide what belongs in the MVP, leave other ideas out, and translate scope into a useful PRD and technical specification.

## What "Working" Looks Like
A beginner enters a garden size such as 2m × 3m or 3m × 4m and selects crops. They receive a clear companion-planting layout, then upload an unwanted-plant photo and receive a plant name, confidence level if available, short explanation, and practical control guidance when identification is strong enough.

If identification is uncertain, the app says “We couldn't confidently identify this plant” and suggests a clearer photo showing the leaves and whole plant, rather than guessing. Validate the flow with a small number of known weed photos without claiming that only those weeds are supported.

The demo proves both useful results are connected to the same garden. Keep the journey short enough to show in roughly a minute; the hackathon targets 2–4 hours of active work and requires a short demo video and public GitHub repository. Deployment is optional.

## The POC Boundary
- One rectangular outdoor home garden or raised bed, measured in meters.
- Four supported crops: tomato, carrot, onion, and basil.
- A simple companion-planting layout and explanation of which selected crops grow well together.
- Upload any unwanted-plant photo and attempt identification through an API; acceptance of a photo does not guarantee identification.
- Present an identification only when the result is strong enough, with confidence if available, a short explanation, and practical control guidance.
- Provide a clear uncertain-identification result and better-photo guidance.
- Keep planning and unwanted-plant identification within the same garden journey.

## Later
No additional features committed for a later release. Supporting crops beyond the initial four is outside this proof of concept.

## Explicitly Cut
- Accounts: unnecessary to demonstrate the one-garden journey.
- Weather, watering reminders, and climate- or location-specific growing recommendations: outside the selected planting and identification proof.
- Disease detection: a separate diagnosis flow.
- Marketplace features and full farm management: beyond the small-garden focus.
- Balconies, hydroponics, greenhouses, containers, and commercial farms: excluded to keep growing-space support limited to a rectangular outdoor plot or raised bed.

## Questions for the Next Planning Steps
The PRD will define layout detail, garden continuity, and result behavior. The technical specification will select the identification API and define how its result supports an identification decision. These implementation choices are not settled by this scope.
