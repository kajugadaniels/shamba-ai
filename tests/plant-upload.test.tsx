import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock("@/lib/client/image", () => ({ prepareImage: mocks.prepare }));
import { PlantUpload } from "@/components/PlantUpload";
import { IdentificationResult } from "@/components/IdentificationResult";
import { normalizeCompanion } from "@/lib/server/companion";
import { normalizeIdentification } from "@/lib/server/identification";
import two from "../devpost/api-checks/companion-two-decimal.json";
import basil from "../devpost/api-checks/weed-basil.json";
const garden = { id: "9512afef-4fa6-4e71-8102-56a1f98698f7", revision: 1, plan: normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato","basil"] }), createdAt: "2026-10-08T08:00:00.000Z", updatedAt: "2026-10-08T08:00:00.000Z" };
beforeEach(() => { mocks.prepare.mockReset(); vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn().mockReturnValue("blob:processed"), revokeObjectURL: vi.fn() })); });
describe("plant upload and result behavior with simulated responses", () => {
  it("previews and uploads the same processed file, and uncertainty has no save action", async () => {
    const original = new File(["phone"], "phone.png", { type: "image/png" }); const processed = new File(["processed"], "plant.jpg", { type: "image/jpeg" });
    mocks.prepare.mockResolvedValue(processed); const fetcher = vi.fn().mockResolvedValue(Response.json({ outcome: "uncertain" })); vi.stubGlobal("fetch", fetcher);
    render(<PlantUpload garden={garden} onBack={() => {}} />);
    await userEvent.upload(screen.getByLabelText("Choose or replace photo"), original);
    expect(await screen.findByAltText("Processed plant photo that will be analyzed")).toHaveAttribute("src", "blob:processed");
    await userEvent.click(screen.getByRole("button", { name: "Identify Plant" }));
    expect(await screen.findByRole("heading", { name: /couldn't confidently identify/ })).toBeVisible();
    expect(URL.createObjectURL).toHaveBeenCalledWith(processed);
    expect(fetcher.mock.calls[0][1].body.get("image")).toBe(processed);
    expect(screen.queryByRole("button", { name: /Retry saving/ })).not.toBeInTheDocument();
  });
  it("shows non-weed score and message with no weed-control section", async () => {
    render(<IdentificationResult result={normalizeIdentification(basil.response)!} saved onBack={() => {}} />);
    await waitFor(() => expect(screen.getByText("Not a weed")).toBeVisible()); expect(screen.getByText("Provider confidence: 99/100")).toBeVisible();
    expect(screen.getByText(/service does not classify it as a weed/)).toBeVisible(); expect(screen.queryByRole("heading", { name: "Control guidance" })).not.toBeInTheDocument();
  });
  it("retries a failed save without another image analysis and shows saved history status", async () => {
    mocks.prepare.mockResolvedValue(new File(["image"], "plant.jpg", { type: "image/jpeg" }));
    const fetcher = vi.fn().mockImplementation((url, options) => {
      if (url.endsWith("/retry")) return Promise.resolve(Response.json({ ...response, saveState: "saved" }));
      const form = options.body as FormData;
      response.context.requestId = String(form.get("requestId"));
      return Promise.resolve(Response.json(response));
    });
    const response = { outcome: "identified", result: normalizeIdentification(basil.response), context: { gardenId: garden.id, gardenRevision: 1, requestId: "" }, receipt: "simulated-result-receipt", saveState: "failed" };
    vi.stubGlobal("fetch", fetcher); render(<PlantUpload garden={garden} onBack={() => {}} />);
    await userEvent.upload(screen.getByLabelText("Choose or replace photo"), new File(["source"], "source.png", { type: "image/png" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Identify Plant" })).toBeEnabled()); await userEvent.click(screen.getByRole("button", { name: "Identify Plant" }));
    await userEvent.click(await screen.findByRole("button", { name: "Retry saving result" }));
    expect(await screen.findByText("Saved to Identification History")).toBeInTheDocument();
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual(["/api/identifications", "/api/identifications/retry"]);
  });
});
