import { describe, expect, it } from "vitest";
import { signPlan, verifyPlan } from "@/lib/server/receipts";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";

const secret = "test-only-signing-secret-not-a-real-credential";
const plan = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
describe("signed plan receipts", () => {
  it("restores exactly the signed normalized plan", () => {
    expect(verifyPlan(signPlan(plan, secret, 1000), secret, 1001)).toEqual(plan);
  });
  it("rejects modified plan data and different signing keys", () => {
    const token = signPlan(plan, secret, 1000);
    const [body, signature] = token.split(".");
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    data.plan.input.widthM = 5;
    const changed = Buffer.from(JSON.stringify(data)).toString("base64url");
    expect(() => verifyPlan(`${changed}.${signature}`, secret, 1001)).toThrow();
    expect(() => verifyPlan(token, "another-test-only-key", 1001)).toThrow();
  });
  it("expires at 24 hours and rejects malformed tokens", () => {
    const token = signPlan(plan, secret, 1000);
    expect(() => verifyPlan(token, secret, 1000 + 86400000)).toThrow("EXPIRED_RECEIPT");
    for (const invalid of ["", "a.b.extra", `${token}.`, "a.%", "x".repeat(40001)]) expect(() => verifyPlan(invalid, secret)).toThrow();
  });
});
