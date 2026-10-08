import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalLoadingProvider, usePageLoading } from "@/components/GlobalLoading";
import { AuthenticatedWorkspace } from "@/components/AuthenticatedWorkspace";
import { GardenWorkspace } from "@/components/GardenWorkspace";
import { rememberDraft, restoreDraft } from "@/lib/client/draft";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";

const clerk = vi.hoisted(() => ({ openSignIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ isLoaded: true, userId: null }), useClerk: () => clerk }));
const plan = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
function Request({ active, label }: { active: boolean; label: string }) { usePageLoading(active, label); return null; }
beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); });

describe("modal sign-in and application loading", () => {
  it("opens the Clerk dialog from sign-in and Save Garden while preserving the preview", async () => {
    rememberDraft({ plan, receipt: "simulated-receipt" }, null);
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    render(<AuthenticatedWorkspace />);
    await screen.findByRole("heading", { name: "Your Garden Plan" });
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(clerk.openSignIn).toHaveBeenCalledWith({ withSignUp: true, forceRedirectUrl: "/", signUpForceRedirectUrl: "/" });
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    expect(restoreDraft(null)?.plan.planId).toBe(plan.planId);
    // Opening/canceling the provider dialog leaves this preview mounted.
    expect(screen.getByRole("heading", { name: "Your Garden Plan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Save Garden" }));
    expect(clerk.openSignIn).toHaveBeenCalledTimes(2);
    expect(restoreDraft(null)?.receipt).toBe("simulated-receipt");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps global progress visible until every overlapping request ends", () => {
    const { rerender, unmount } = render(<GlobalLoadingProvider><Request active label="Loading garden…" /><Request active label="Loading history…" /></GlobalLoadingProvider>);
    expect(screen.getByRole("status", { name: "Application loading" })).toHaveTextContent("Loading history…");
    rerender(<GlobalLoadingProvider><Request active={false} label="Loading garden…" /><Request active label="Loading history…" /></GlobalLoadingProvider>);
    expect(screen.getByRole("status", { name: "Application loading" })).toHaveTextContent("Loading history…");
    rerender(<GlobalLoadingProvider><Request active={false} label="Loading garden…" /></GlobalLoadingProvider>);
    expect(screen.queryByRole("status", { name: "Application loading" })).not.toBeInTheDocument();
    unmount();
  });
  it("clears progress on restoration failure and registers a retry until it completes", async () => {
    let reject!: (error: Error) => void;
    let resolve!: (response: Response) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(new Promise((_, fail) => { reject = fail; })).mockReturnValueOnce(new Promise((done) => { resolve = done; })));
    render(<GlobalLoadingProvider><GardenWorkspace userId="simulated-owner" /></GlobalLoadingProvider>);
    expect(screen.getByRole("status", { name: "Application loading" })).toHaveTextContent("Loading your saved garden…");
    await waitFor(() => expect(reject).toBeTypeOf("function"));
    await act(async () => reject(new Error("simulated failure")));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be loaded");
    expect(screen.queryByRole("status", { name: "Application loading" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry loading garden" }));
    expect(await screen.findByRole("status", { name: "Application loading" })).toBeVisible();
    await act(async () => resolve(Response.json({ garden: null })));
    await waitFor(() => expect(screen.queryByRole("status", { name: "Application loading" })).not.toBeInTheDocument());
  });
});
