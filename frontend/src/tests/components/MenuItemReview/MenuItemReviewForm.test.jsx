import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  test("renders correctly with all labels and default button", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByText(/Create/);
    expect(screen.getByText("Item Id")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Email")).toBeInTheDocument();
    expect(screen.getByText("Stars (1 to 5)")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed (iso format)")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.queryByTestId("MenuItemReviewForm-id")).not.toBeInTheDocument();
  });

  test("renders correctly when passing in a MenuItemReview", async () => {
    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.oneReview[0]}
          buttonLabel="Update"
        />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-id");
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId("MenuItemReviewForm-id")).toHaveValue("1");
    expect(screen.getByTestId("MenuItemReviewForm-id")).toBeDisabled();
    expect(screen.getByTestId("MenuItemReviewForm-reviewerEmail")).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  test("Correct error messages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-submit");
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText("Item Id is required.");
    expect(screen.getByText("Reviewer Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Stars is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments is required.")).toBeInTheDocument();

    expect(screen.getByTestId("MenuItemReviewForm-itemId")).toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-reviewerEmail")).toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-dateReviewed")).toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-comments")).toHaveClass("is-invalid");
  });

  test("Correct error messages on bad input (low values, bad email)", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText("Item Id must be at least 1.");
    expect(
      screen.getByText("Reviewer Email must be a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Stars must be at least 1.")).toBeInTheDocument();
  });

  test("Correct error message when stars is too high", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-stars");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText("Stars must be at most 5.");
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
      target: { value: "Great food" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be/)).not.toBeInTheDocument();
    expect(screen.getByTestId("MenuItemReviewForm-itemId")).not.toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-reviewerEmail")).not.toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-stars")).not.toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-dateReviewed")).not.toHaveClass("is-invalid");
    expect(screen.getByTestId("MenuItemReviewForm-comments")).not.toHaveClass("is-invalid");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-cancel");
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});