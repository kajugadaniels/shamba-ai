import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GardenProgressDialog } from "@/components/GardenProgressDialog";
import { GlobalLoadingProvider, usePageLoading } from "@/components/GlobalLoading";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(() => { vi.useRealTimers(); });
function OtherRequest() { usePageLoading(true, "Loading history…"); return null; }
const props = { width: "1.5", length: "2.5", crops: ["tomato", "basil"] as const };
function Progress({ onCancel = () => {} }: { onCancel?: () => void }) { return <GardenProgressDialog {...props} crops={[...props.crops]} onCancel={onCancel} />; }

describe("garden generation progress", () => {
  it("labels estimated waiting honestly and switches to indeterminate after the estimate", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
    const { unmount } = render(<Progress />);
    const bar = screen.getByRole("progressbar", { name: "Estimated waiting progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText(/Time-based estimate, not live progress/)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20000));
    expect(bar).toHaveAttribute("aria-valuenow", "45");
    expect(screen.getByText("20s elapsed")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20000));
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByRole("status")).toHaveTextContent("Still waiting");
    act(() => vi.advanceTimersByTime(35000));
    expect(screen.getByRole("status")).toHaveTextContent("longer than expected");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("offers cancellation without inventing a completion event", () => {
    const cancel = vi.fn(); render(<Progress onCancel={cancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel generation" }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(screen.getByText(/choices will stay here/)).toBeInTheDocument();
  });
  it("suppresses the global card while the dedicated dialog is open and restores it afterward", async () => {
    const { rerender } = render(<GlobalLoadingProvider><OtherRequest /><Progress /></GlobalLoadingProvider>);
    expect(screen.getByRole("dialog", { name: "Growing your garden plan" })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("status", { name: "Application loading" })).not.toBeInTheDocument());
    rerender(<GlobalLoadingProvider><OtherRequest /></GlobalLoadingProvider>);
    expect(await screen.findByRole("status", { name: "Application loading" })).toHaveTextContent("Loading history…");
  });
});
