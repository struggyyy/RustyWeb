/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */

// External imports
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Internal imports
import PhoneCrashState from "@/components/features/home/PhoneCrashState";

describe("PhoneCrashState", () => {
  it("renders crash message and error code", () => {
    // onRestart mock
    const onRestart = vi.fn();
    render(<PhoneCrashState onRestart={onRestart} />);

    expect(screen.getByText("System Failure")).toBeInTheDocument();
    expect(
      screen.getByText("Connection to image server interrupted."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Error Code: 0xDEADBEEF/)).toBeInTheDocument();
  });

  it("renders restart button with correct text", () => {
    const onRestart = vi.fn();
    render(<PhoneCrashState onRestart={onRestart} />);

    expect(screen.getByText("RESTART_SYSTEM")).toBeInTheDocument();
  });

  it("calls onRestart handler when button is clicked", () => {
    const onRestart = vi.fn();
    render(<PhoneCrashState onRestart={onRestart} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
