import { render, screen } from "@testing-library/react";

import { FeedPagination } from "@/components/feed-pagination";

const previous = () => screen.getByLabelText("Go to previous page");
const next = () => screen.getByLabelText("Go to next page");

/** A disabled end must not be a link, a button or a tab stop. */
const expectDisabled = (control: HTMLElement) => {
  expect(control).not.toHaveAttribute("href");
  expect(control).not.toHaveAttribute("role");
  expect(control).not.toHaveAttribute("tabindex");
  expect(control).toHaveAttribute("aria-disabled", "true");
};

describe("FeedPagination", () => {
  it("links Prev and Next to the neighbouring pages, keeping the feed", () => {
    render(<FeedPagination feed="new" page={2} totalPages={5} />);

    expect(
      screen.getByRole("link", { name: "Go to previous page" }),
    ).toHaveAttribute("href", "/?feed=new&page=1");
    expect(
      screen.getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/?feed=new&page=3");
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables Prev on the first page", () => {
    render(<FeedPagination feed="top" page={1} totalPages={5} />);

    expectDisabled(previous());
    expect(next()).toHaveAttribute("href", "/?feed=top&page=2");
  });

  it("disables Next on the last page", () => {
    render(<FeedPagination feed="best" page={5} totalPages={5} />);

    expectDisabled(next());
    expect(previous()).toHaveAttribute("href", "/?feed=best&page=4");
  });

  it.each([0, 1])("renders nothing when there are %i pages", (totalPages) => {
    const { container } = render(
      <FeedPagination feed="top" page={1} totalPages={totalPages} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
