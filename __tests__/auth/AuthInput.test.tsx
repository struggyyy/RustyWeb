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
import { Mail } from "lucide-react";

// Internal imports
import AuthInput from "@/components/features/auth/AuthInput";

describe("AuthInput", () => {
  it("renders with label and value", () => {
    render(
      <AuthInput
        label="Email Address"
        value="test@example.com"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    // We can verify if the icon component is rendered.
    // Since lucide icons are SVGs, we can look for SVG or rely on class checking if needed, or just that it doesn't crash.
    // A better way is to check if the container has the icon.
    // For this test, we accept if it renders without error.
    const { container } = render(
      <AuthInput label="Email" icon={Mail} value="" onChange={() => {}} />,
    );
    // Lucide icons usually render an svg
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    // We need to render a password input
    render(
      <AuthInput
        label="Password"
        type="password"
        value="secret"
        onChange={() => {}}
      />,
    );

    const input = screen.getByDisplayValue("secret") as HTMLInputElement;
    expect(input.type).toBe("password");

    // Find toggle button (Eye/EyeOff)
    // The button is strictly for toggling.
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    expect(input.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(input.type).toBe("password");
  });

  it("calls onClear when clear button is clicked", () => {
    const handleClear = vi.fn();
    render(
      <AuthInput
        label="Username"
        value="myuser"
        onChange={() => {}}
        showClearButton={true}
        onClear={handleClear}
      />,
    );

    // Clear button only shows if type != password and showClearButton is true and value is present
    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("applies error styling when isError is true", () => {
    // We can check for specific classes that indicate error
    const { container } = render(
      <AuthInput
        label="Error Input"
        value=""
        onChange={() => {}}
        isError={true}
      />,
    );

    // Look for red border or background class
    // From AuthInput.tsx: "bg-red-50/50" or "text-red-900"
    const inputWrapper = container.querySelector("input");
    // The input itself has 'text-red-900'
    expect(inputWrapper).toHaveClass("text-red-900");
  });
});
