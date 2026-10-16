import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeToggle } from "@/components/theme-toggle";

const setTheme = jest.fn();
let resolvedTheme = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    resolvedTheme = "light";
  });

  it("has an accessible name", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("switches from light to dark", () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from dark to light", () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
