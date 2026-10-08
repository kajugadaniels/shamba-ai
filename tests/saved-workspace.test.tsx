import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GardenWorkspace } from "@/components/GardenWorkspace";
import { rememberDraft } from "@/lib/client/draft";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";
const original = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
const saved = { id: "9512afef-4fa6-4e71-8102-56a1f98698f7", revision: 1, plan: original, createdAt: "2026-10-08T08:00:00.000Z", updatedAt: "2026-10-08T08:00:00.000Z" };
beforeEach(() => {
  sessionStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
describe("saved garden journey with simulated server responses", () => {
  it("restores My Garden and canceling edits performs no mutation", async () => {
    const fetcher = vi.fn().mockImplementation((url) => Promise.resolve(Response.json(url === "/api/garden" ? { garden: saved } : { history: [] })));
    vi.stubGlobal("fetch", fetcher); render(<GardenWorkspace userId="owner-a" />);
    expect(await screen.findByRole("heading", { name: "My Garden" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Change Garden" }));
    expect(screen.getByLabelText(/Width/)).toHaveValue(1.5);
    fireEvent.change(screen.getByLabelText(/Width/), { target: { value: "3" } });
    await userEvent.click(screen.getByRole("button", { name: /Cancel changes/ }));
    expect(await screen.findByRole("heading", { name: "My Garden" })).toBeVisible();
    expect(screen.getByText(/1.5m × 2.5m/)).toBeVisible();
    expect(fetcher.mock.calls.every((call) => !call[1]?.method)).toBe(true);
  });
  it("preserves a visitor draft after sign-in and replaces only after confirmation", async () => {
    const next = normalizeCompanion(two.response, { widthM: 2.5, lengthM: 3.5, crops: ["tomato", "basil"] });
    rememberDraft({ plan: next, receipt: "simulated-signed-plan" }, null);
    const fetcher = vi.fn().mockImplementation((url, options) => Promise.resolve(Response.json(options?.method === "PUT" ? { garden: { ...saved, revision: 2, plan: next } } : url === "/api/garden" ? { garden: saved } : { history: [] })));
    vi.stubGlobal("fetch", fetcher); render(<GardenWorkspace userId="owner-a" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Save Garden" })).toBeEnabled());
    await waitFor(() => expect(screen.getByText(/2.5m × 3.5m/)).toBeVisible());
    await userEvent.click(screen.getByRole("button", { name: "Save Garden" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("cannot be undone");
    expect(screen.getByRole("dialog")).toHaveTextContent("history belongs to the old garden");
    await userEvent.click(screen.getByRole("button", { name: "Keep my saved garden" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetcher.mock.calls.filter((call) => call[1]?.method === "PUT")).toHaveLength(0);
    await userEvent.click(screen.getByRole("button", { name: "Save Garden" }));
    await userEvent.click(screen.getByRole("button", { name: "Replace Garden" }));
    expect(await screen.findByRole("heading", { name: "My Garden" })).toBeVisible();
    const body = JSON.parse(fetcher.mock.calls.find((call) => call[1]?.method === "PUT")![1].body);
    expect(body).toEqual({ receipt: "simulated-signed-plan", expectedRevision: 1, confirmReplacement: true });
    expect(sessionStorage.length).toBe(0);
  });
  it("blocks saving on restoration failure rather than assuming no saved garden", async () => {
    rememberDraft({ plan: original, receipt: "simulated-plan" }, null);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 503 })));
    render(<GardenWorkspace userId="owner-a" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Retry before saving");
    expect(screen.getByRole("button", { name: "Save Garden" })).toBeDisabled();
  });
  it("clears private form and draft state on sign-out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url) => Promise.resolve(Response.json(url === "/api/garden" ? { garden: saved } : { history: [] }))));
    const signOut = vi.fn().mockResolvedValue(undefined);
    render(<GardenWorkspace userId="owner-a" onSignOut={signOut} />);
    await screen.findByRole("heading", { name: "My Garden" });
    await userEvent.click(screen.getByRole("button", { name: "Change Garden" }));
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByLabelText(/Width/)).toHaveValue(null); expect(signOut).toHaveBeenCalledOnce();
    expect(sessionStorage.length).toBe(0);
  });
  it("retries restoration without discarding the generated preview", async () => {
    rememberDraft({ plan: original, receipt: "simulated-plan" }, null);
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("simulated outage"))
      .mockResolvedValue(Response.json({ garden: saved }));
    vi.stubGlobal("fetch", fetcher); render(<GardenWorkspace userId="owner-a" />);
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Retry loading garden" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Save Garden" })).toBeEnabled());
    expect(screen.getByRole("heading", { name: "Your Garden Plan" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("keeps a first-save preview on database failure and retries without regeneration", async () => {
    rememberDraft({ plan: original, receipt: "simulated-plan" }, null);
    let saves = 0;
    const fetcher = vi.fn().mockImplementation((url, options) => {
      if (options?.method === "PUT") {
        saves++;
        return Promise.resolve(saves === 1 ? Response.json({ error: { message: "Simulated database outage." } }, { status: 503 }) : Response.json({ garden: saved }));
      }
      return Promise.resolve(Response.json(url === "/api/garden" ? { garden: null } : { history: [] }));
    });
    vi.stubGlobal("fetch", fetcher); render(<GardenWorkspace userId="owner-a" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Save Garden" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Save Garden" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Simulated database outage.");
    expect(screen.getByRole("heading", { name: "Your Garden Plan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Save Garden" }));
    await screen.findByRole("heading", { name: "My Garden" });
    expect(fetcher.mock.calls.some((call) => call[0] === "/api/plans")).toBe(false);
    expect(saves).toBe(2);
  });

  it("reloads the owned saved garden after failed sign-out without restoring private drafts", async () => {
    const fetcher = vi.fn().mockImplementation((url) => Promise.resolve(Response.json(url === "/api/garden" ? { garden: saved } : { history: [] })));
    vi.stubGlobal("fetch", fetcher);
    let rejectSignOut!: (reason: Error) => void;
    const signOut = vi.fn().mockReturnValue(new Promise<void>((_, reject) => { rejectSignOut = reject; }));
    render(<GardenWorkspace userId="owner-a" onSignOut={signOut} />);
    await screen.findByRole("heading", { name: "My Garden" });
    await userEvent.click(screen.getByRole("button", { name: "Change Garden" }));
    fireEvent.change(screen.getByLabelText(/Width/), { target: { value: "4" } });
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByLabelText(/Width/)).toHaveValue(null);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeDisabled();
    rejectSignOut(new Error("simulated Clerk failure"));
    expect(await screen.findByRole("heading", { name: "My Garden" })).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Sign-out could not finish");
    expect(fetcher.mock.calls.filter((call) => call[0] === "/api/garden")).toHaveLength(2);
    expect(sessionStorage.length).toBe(0);
    expect(screen.queryByLabelText(/Width/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  });

});
