import { fireEvent, render, screen } from "@testing-library/react";

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  const error = new Error("boom");

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a friendly message and logs the error", () => {
    render(<ErrorPage error={error} retry={jest.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load stories/i,
    );
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("calls retry when Try again is clicked", () => {
    const retry = jest.fn();
    render(<ErrorPage error={error} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
