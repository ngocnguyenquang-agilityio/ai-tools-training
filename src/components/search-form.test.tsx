import { render, screen } from "@testing-library/react";

import { SearchForm } from "@/components/search-form";

// next/form needs the app router; a plain form keeps the GET contract under test.
jest.mock("next/form", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"form">) => <form {...props} />,
}));

describe("SearchForm", () => {
  it("submits a required q field to /search", () => {
    render(<SearchForm />);

    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/search");
    const input = screen.getByRole("searchbox", { name: "Search stories" });
    expect(input).toHaveAttribute("name", "q");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("maxLength", "200");
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
