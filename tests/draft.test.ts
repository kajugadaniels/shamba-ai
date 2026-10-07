import { beforeEach, describe, expect, it } from "vitest";
import { rememberDraft, restoreDraft, forgetDraft } from "@/lib/client/draft";
import { assertTestDatabase } from "../scripts/test-database-guard.mjs";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";
beforeEach(() => sessionStorage.clear());
describe("same-tab draft and database safeguards", () => {
  it("preserves a public draft across sign-in and prevents another account claiming it", () => {
    const draft = { plan: normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] }), receipt: "simulated-receipt" };
    rememberDraft(draft, null); expect(restoreDraft("user-a")).toEqual(draft);
    expect(restoreDraft("user-b")).toBeNull(); expect(restoreDraft("user-a")).toBeNull();
  });
  it("clears saved pending data on sign-out", () => {
    sessionStorage.setItem("shamba.pending-garden.v1", "invalid"); forgetDraft(); expect(sessionStorage.length).toBe(0);
  });
  it("refuses a missing test URL and the pooled alias of the runtime database", () => {
    expect(() => assertTestDatabase({})).toThrow("TEST_DATABASE_URL_REQUIRED");
    expect(() => assertTestDatabase({ TEST_DATABASE_URL: "postgresql://test:fake@ep-demo.neon.tech/neondb", DATABASE_URL: "postgresql://runtime:fake@ep-demo-pooler.neon.tech/neondb", DIRECT_URL: "postgresql://runtime:fake@ep-demo.neon.tech/neondb" })).toThrow("TEST_DATABASE_MUST_BE_SEPARATE");
    expect(assertTestDatabase({ TEST_DATABASE_URL: "postgresql://test:fake@ep-tests.neon.tech/neondb", DATABASE_URL: "postgresql://runtime:fake@ep-demo-pooler.neon.tech/neondb", DIRECT_URL: "postgresql://runtime:fake@ep-demo.neon.tech/neondb" })).toContain("ep-tests");
  });
  it("fails closed when either application reference is missing or the test target is pooled", () => {
    const references = { DATABASE_URL: "postgresql://runtime:fake@ep-app-pooler.neon.tech/neondb", DIRECT_URL: "postgresql://runtime:fake@ep-app.neon.tech/neondb" };
    expect(() => assertTestDatabase({ TEST_DATABASE_URL: "postgresql://test:fake@ep-tests.neon.tech/neondb" })).toThrow("APPLICATION_DATABASE_REFERENCES_REQUIRED");
    expect(() => assertTestDatabase({ ...references, TEST_DATABASE_URL: "postgresql://test:fake@ep-tests-pooler.neon.tech/neondb" })).toThrow("DIRECT_TEST_DATABASE_REQUIRED");
  });

});
