import { render, screen } from "@testing-library/react";

import Loading from "@/app/loading";

describe("Loading", () => {
  it("renders a labelled list of skeleton cards", () => {
    const { container } = render(<Loading />);

    expect(
      screen.getByRole("status", { name: /loading stories/i }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(6);
  });
});
