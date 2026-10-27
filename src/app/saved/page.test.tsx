import { render, screen } from "@testing-library/react";

import SavedPage, { metadata } from "@/app/saved/page";

describe("SavedPage", () => {
  it("titles the tab Saved · Tech News", () => {
    expect(metadata.title).toBe("Saved · Tech News");
  });

  it("has a Saved stories heading above the list", () => {
    render(<SavedPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Saved stories" }),
    ).toBeInTheDocument();
  });
});
