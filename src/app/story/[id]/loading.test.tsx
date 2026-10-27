import { render, screen } from "@testing-library/react";

import Loading from "@/app/story/[id]/loading";

describe("Story Loading", () => {
  it("renders a labelled placeholder for the story and its comments", () => {
    render(<Loading />);

    expect(
      screen.getByRole("status", { name: /loading story/i }),
    ).toBeInTheDocument();
  });
});
