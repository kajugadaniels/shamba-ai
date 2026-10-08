import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/Button";

describe("shared action button", () => {
  it("keeps the action label and blocks repeat clicks until loading ends", async () => {
    const click = vi.fn();
    const { rerender } = render(<Button variant="primary" loading onClick={click}>Identify Plant</Button>);
    const button = screen.getByRole("button", { name: "Identify Plant" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading", "true");
    await userEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    rerender(<Button variant="primary" onClick={click}>Identify Plant</Button>);
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("data-loading");
    await userEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });
  it("defaults to a non-submit button and preserves explicit disabled state", () => {
    const { rerender } = render(<Button disabled>Change Garden</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    expect(screen.getByRole("button")).toBeDisabled();
    rerender(<Button type="submit" variant="destructive">Replace Garden</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
