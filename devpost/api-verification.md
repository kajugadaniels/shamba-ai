# RapidAPI Verification — Shamba AI

Checked 2026-10-07. Research supporting `prd.md > Technical-Spec Investigations`; this is not an approved technical specification.

## Evidence and Limits

Read the public RapidAPI listings' embedded provider README, OpenAPI 3.0.3 definitions (API version 1.0.0), public gateway host metadata, and public billing-plan metadata. The web reader could not open the listings; direct HTTPS retrieval succeeded. Both provider-origin `GET /` service-info endpoints returned HTTP 200 and `status: active`.

No authenticated `/analyze` call has been made. Documented examples verify the provider's stated contract, not actual prediction quality, field completeness, latency, confidence calibration, or subscription access. No subscription has been purchased. A live analysis check is required before finalizing response adapters and identification policy.

Sources:
- [Companion listing, README, and OpenAPI](https://rapidapi.com/bilgisamapi-api6-bilgisam/api/companion-planting-api-ai-garden-planner-layout/playground/serviceInfo)
- [Weed listing, README, and OpenAPI](https://rapidapi.com/bilgisamapi-api6-bilgisam/api/weed-identification-api-ai-weed-detection-control/playground)
- [Companion public service info](https://companionplantingplanner.service1.api.bilgisam.com/)
- [Weed public service info](https://weedidentification.service1.api.bilgisam.com/)

## Endpoints and Authentication

Both document:
- `GET /`: service info.
- `POST /analyze`: primary analysis, accepting JSON or multipart form data.
- `GET /analyze`: analysis with query parameters; uploaded binary files require POST multipart.

Use the RapidAPI gateways, with `X-RapidAPI-Key` and `X-RapidAPI-Host`, as documented in provider examples:
- `https://companion-planting-api-ai-garden-planner-layout.p.rapidapi.com`
- `https://weed-identification-api-ai-weed-detection-control.p.rapidapi.com`

OpenAPI lists provider-origin servers instead of these gateways. The public service-info checks used those origins only; they do not verify authenticated gateway access. API keys belong on the application server, never in the browser or committed files.

## Companion Request

At least one of `plants`, `image`, or `imageUrl` is required by the README. No photo is needed for Shamba AI's crop-list flow.

| Field | Documented input |
|---|---|
| `plants` | Comma-separated string; README also accepts an array, max 1000 characters |
| `bedWidthM`, `bedLengthM` | Bed dimensions in meters |
| `language` | ISO language code; defaults to `en` |
| `image` | Multipart photo file, JPG/PNG/WEBP, max 10 MB |
| `imageUrl` | Public direct photo URL |
| `sun`, `climate`, `season`, `country`, `goal` | Optional context; goal max 500 characters |

Contract discrepancy: OpenAPI types `plants` and dimensions as strings, whereas the README accepts an array and numeric dimensions too. Use a comma-separated crop string and string dimensions initially, then verify live. Do not invent climate, country, season, or sunlight inputs the user has not supplied.

Candidate request using documented fields (not a tested response):

```json
{
  "plants": "tomato,carrot,onion,basil",
  "bedWidthM": "3",
  "bedLengthM": "4",
  "language": "en"
}
```

## Companion Response Mapping

Both APIs document the top-level envelope `status`, `message`, `result`, `metadata`, and `cacheTime`. OpenAPI leaves `result` as an unstructured object; nested fields below come from the provider README's example/field guide, not a strict required-field schema.

| Shamba AI need | Documented field(s) | Limitation |
|---|---|---|
| Crop identity | `result.plants[].name`, `.englishName`, `.scientificName`, `.source`, `.family` | Also includes photo/suggested plants; match only selected crops |
| Positive companions | `result.goodPairs[].plants`, `.benefit`, `.explanation` | Provider-generated guidance; not an independent agronomic verification |
| Incompatible pairs | `result.badPairs[].plants`, `.problem`, `.explanation`; `result.knownConflicts[].plants`, `.evidence`, `.reason` | Known-conflict evidence distinguishes `strong` and `traditional`; absence does not prove compatibility |
| Layout advice | `result.layout.description`; `.rows[].position`, `.plants`, `.why` | Rows/directional labels, not crop polygons or numeric placement coordinates |
| Spacing | `result.layout.rows[].spacingCm` | Described as distance between plants in that row; not a complete capacity model |
| Plant quantities | `result.plants[].count` | Photo detection count; list-only sample crops have zero counts, not planned quantities |
| Capacity/fit | No dedicated field documented | No `fits`, bed-capacity value, row widths, planned quantities, or complete spacing constraints |
| Confidence | `result.overallConfidence` | Not a capacity guarantee or per-relationship evidence measure |

The sample `metadata.plants` includes carrot but the sample result's plants/rows omit carrot. It also mixes selected/photo crops. Do not silently render a valid plan if a live response omits selected crops or incorporates unselected crops. Validate coverage and consistency before displaying/saving.

The map must be rendered by Shamba AI from validated row guidance. Screen zone dimensions are illustrative placement, not API-provided agricultural geometry. Since reliable capacity evidence is not established, use the approved companion-placement-guide fallback; do not infer an insufficient-space verdict from one row spacing value.

Keep the provider's distinctions between evidence and traditional advice. The sample Basil/Tomato explanation qualifies a traditional claim; do not flatten that into guaranteed pest control. Carrot/Onion compatibility is not established by this sample and needs separate verification.

Suggested additions, succession, rotation, photo issues, and pest-management sections exist in the documented response but remain outside the approved product flow.

## Weed Request

Supply one of multipart `image` or public `imageUrl`. JSON and GET require `imageUrl`; multipart accepts an uploaded file without public photo storage.

| Field | Documented input |
|---|---|
| `image` | One JPG/PNG/WEBP photo, max 10 MB, multipart only |
| `imageUrl` | Public direct image URL |
| `language` | Defaults to `en` |
| `system` | `field`, `garden`, `pasture`, `lawn`, `orchard`, or `organic` |
| `crop` | Optional crop context used for herbicide-safety classification |
| `cropStage` | Optional growth-stage context |
| `country` | Optional regional resistance/regulatory context |
| `notes` | Optional text, max 1000 characters |

For the existing upload flow, POST multipart can send `image`, `language=en`, and an agreed `system` without retaining the photo. The API documents singular `crop`; it does not document multi-crop safety assessment. A comma-separated list in `crop` must not be assumed to validate herbicides for the whole mixed bed. `system=organic` is documented to remove chemical options; whether to use it or garden mode needs learner agreement.

## Weed Response Mapping

| Shamba AI need | Documented field(s) | Limitation |
|---|---|---|
| Plant name | `result.weed.commonName`, `.scientificName` | Example identifies Blackgrass; not proof of accuracy on other plants |
| Identification confidence | `result.confidence` | Example value 82; no explicit range/calibration/threshold documented |
| Overall confidence | `result.overallConfidence` | Example value 80, distinct from identification confidence; do not substitute silently |
| Explanation | `result.identificationFeatures[]`; `result.weed.family`, `.plantType`, `.lifecycle`, `.growthStage`, `.lookAlikes`; `result.threat` | No standalone `explanation` field documented; assemble concise text from supplied facts |
| Control guidance | `result.control.mechanical`, `.cultural`, `.biological`, `.organicApproved`; `result.controlWindow` | May include field-crop advice inappropriate for a small home garden |
| Chemical advice | `result.control.chemical`, `.notSafeOnThisCrop`; `result.resistance` | Optional context-dependent output; not proof of safety for all four crops or local authorization |
| Crop/desirable plant | `result.isWeed` | README explicitly documents false for crop/desirable plants; product behavior needs a decision |
| Identification date | `metadata.queryTime`; `cacheTime` | Provider fields may reflect caching; persist app identification time separately |

The numeric examples suggest a percentage-like confidence scale, but that is an inference, not a documented scale contract. Confirm range, meaning, missing-field behavior, and actual low-confidence/non-plant responses before choosing a threshold or displaying a percent sign. No explicit uncertain-result status/shape is documented; Shamba AI needs its own validated decision policy.

Do not add a separate language-model service simply because explanation is composed from multiple existing fields. Missing explanation/control content must be handled explicitly, without inventing API fields or advice.

## Usage Limits and Runtime

Public billing metadata at the check date:

| API | Plan | Requests/month | Quota behavior |
|---|---|---:|---|
| Companion | BASIC | 50 | Hard limit |
| Companion | PRO | 1500 | Soft limit with paid overage |
| Companion | ULTRA | 7500 | Soft limit with paid overage |
| Companion | MEGA | 30000 | Soft limit with paid overage |
| Weed | BASIC | 30 | Hard limit |
| Weed | PRO | 1000 | Soft limit with paid overage |
| Weed | ULTRA | 5000 | Soft limit with paid overage |
| Weed | MEGA | 20000 | Soft limit with paid overage |

BASIC monthly price is listed as zero for each API. Each billing item states every endpoint call counts as one request. Paid plans' pricing/overage must be rechecked at subscription time; none has been selected.

Both BASIC plans have a rate-limit object containing 250/minute but `enabled: false`; paid-plan rateLimit is null. These values do not establish an enforced 250/minute limit or unlimited throughput. Actual gateway throttling remains unverified.

Both READMEs claim typical processing of 10–40 seconds; this has not been measured. Their Python examples use a 120-second timeout. Design loading/timeout behavior and hosting duration limits around live measurements, not a guaranteed response time.

## Required Checks Before Finalizing Integration

1. With locally configured RapidAPI credentials and confirmed subscriptions, test list-only plans for the four crops and smaller subsets, using decimal dimensions. Record sanitized actual responses and latency.
2. Validate selected-crop coverage, absence of unintended additions, directional row structure, pair/conflict consistency, and behavior with omitted optional context.
3. Test known weed photos, an ambiguous/non-plant photo, and a crop/desirable-plant photo. Verify names, confidence values/range, isWeed behavior, and garden-relevant controls. Use only a small test set within the monthly quota.
4. Confirm authentication/quota errors, empty/malformed output handling, upload formats/size, and gateway timeout behavior. Do not exhaust quotas deliberately.
5. Agree on the confidence policy, control-guidance filtering, and behavior for confidently identified non-weeds. Finalize normalized application fields only after these checks.

Until live checks are possible, retain these as integration risks rather than treating README samples as validated runtime fixtures.
