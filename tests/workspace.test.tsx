import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GardenWorkspace } from "@/components/GardenWorkspace";
import { GardenMap } from "@/components/GardenMap";
import { GardenPlan } from "@/components/GardenPlan";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";

async function fill() {
  fireEvent.change(screen.getByLabelText(/Width/), { target: { value: "1.5" } });
  fireEvent.change(screen.getByLabelText(/Length/), { target: { value: "2.5" } });
  await userEvent.click(screen.getByRole("button", { name: "Tomato" }));
  await userEvent.click(screen.getByRole("button", { name: "Basil" }));
}

describe("visitor planning experience", () => {
  it.each([[5, 1], [1, 5]])("keeps numbered zones, named key, and proportions for extreme %sm × %sm beds", (widthM, lengthM) => {
    const plan = normalizeCompanion(two.response, { widthM, lengthM, crops: ["tomato", "basil"] });
    render(<GardenMap plan={plan} />);
    expect(screen.getByRole("group", { name: "Tomato" })).toBeInTheDocument();
    expect(screen.getAllByRole("group", { name: "Basil" })).toHaveLength(2);
    expect(screen.getByText("Tomato")).toBeVisible();
    expect(screen.getByText("Basil")).toBeVisible();
    const tomatoZone = screen.getByRole("group", { name: "Tomato" });
    expect(within(tomatoZone).getByText("1")).toBeInTheDocument();
    expect(within(tomatoZone).queryByText("Tomato")).not.toBeInTheDocument();
    const bed = screen.getByRole("group", { name: "Row 1" }).parentElement!;
    expect(bed.style.getPropertyValue("--map-ratio")).toBe(`${widthM} / ${lengthM}`);
  });
  it("gives simulated strong conflicts a distinct warning treatment while retaining advisory wording", () => {
    const plan = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
    // Presentation-only simulated evidence; no claim of observed provider output.
    plan.relationships = [
      { crops: ["tomato", "basil"], kind: "conflict", evidence: "strong", explanation: "Simulated strong conflict." },
      { crops: ["tomato", "basil"], kind: "advisory", evidence: "traditional", explanation: "Some gardening guidance suggests keeping these crops apart." },
    ];
    // Distinct pair keys normally come from the normalizer; render each separately
    // to compare styles without introducing contradictory notes into one plan.
    const advisory = plan.relationships[1];
    plan.relationships = [plan.relationships[0]];
    const { rerender } = render(<GardenPlan plan={plan} onChange={() => {}} />);
    const strong = screen.getByText("Provider code-checked conflict");
    const strongClass = strong.parentElement!.className;
    expect(strong).toBeVisible();
    expect(screen.getByText(/not independent verification/)).toBeVisible();
    rerender(<GardenPlan plan={{ ...plan, relationships: [advisory] }} onChange={() => {}} />);
    expect(screen.getByText("Companion advisory").parentElement!.className).not.toBe(strongClass);
    expect(screen.getByText("Some gardening guidance suggests keeping these crops apart.")).toBeVisible();
    expect(screen.queryByText("Provider code-checked conflict")).not.toBeInTheDocument();
  });
  it("shows inline errors instead of generating an incomplete plan", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    render(<GardenWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: /Generate Garden Plan/ }));
    expect(screen.getByText("Width must be between 1 and 5 meters.")).toBeVisible();
    expect(screen.getByText(/Choose at least two crops for/)).toBeVisible();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("displays a normalized map and restores dimensions/selected crops on Change Garden", async () => {
    const plan = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
    const fetcher = vi.fn().mockResolvedValue(Response.json({ plan, receipt: "test-receipt" })); vi.stubGlobal("fetch", fetcher);
    render(<GardenWorkspace />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /Generate Garden Plan/ }));
    expect(await screen.findByRole("heading", { name: "Your Garden Plan" })).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("figure", { name: /Top-down/ })).toBeVisible());
    expect(screen.getByRole("button", { name: "Save Garden" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Change Garden" }));
    expect(screen.getByLabelText(/Width/)).toHaveValue(1.5);
    expect(screen.getByLabelText(/Length/)).toHaveValue(2.5);
    expect(screen.getByRole("button", { name: "Basil" })).toHaveAttribute("aria-pressed", "true");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("retains inputs after a provider failure and permits explicit retry", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ error: { message: "The garden planner is unavailable." } }, { status: 502 })); vi.stubGlobal("fetch", fetcher);
    render(<GardenWorkspace />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /Generate Garden Plan/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The garden planner is unavailable.");
    expect(screen.getByLabelText(/Width/)).toHaveValue(1.5);
    expect(screen.getByRole("button", { name: "Tomato" })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(screen.getByRole("button", { name: /Generate Garden Plan/ })).toBeEnabled());
  });
  it("prevents repeated submissions while a request is processing", async () => {
    const fetcher = vi.fn().mockReturnValue(new Promise(() => {})); vi.stubGlobal("fetch", fetcher);
    render(<GardenWorkspace />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /Generate Garden Plan/ }));
    const loading = screen.getByRole("button", { name: /Creating your garden guide/ });
    expect(loading).toBeDisabled();
    await userEvent.click(loading);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
