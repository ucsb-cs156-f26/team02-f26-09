import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  const testId = "RecommendationRequestForm";

  const expectedLabels = [
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested (iso format)",
    "Date Needed (iso format)",
    "Done",
  ];

  const renderForm = (props = {}) =>
    render(
      <Router>
        <RecommendationRequestForm {...props} />
      </Router>,
    );

  const fillInValidForm = () => {
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "phtcon@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "BS/MS program" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "2022-04-20T10:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2022-05-01T10:00" },
    });
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-done`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: recommendationRequestFixtures.oneRecommendationRequest,
      buttonLabel: "Update",
    });

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-professorEmail`)).toHaveValue(
      "phtcon@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      "BS/MS program",
    );
    expect(screen.getByTestId(`${testId}-dateRequested`)).toHaveValue(
      "2022-04-20T00:00",
    );
    expect(screen.getByTestId(`${testId}-dateNeeded`)).toHaveValue(
      "2022-05-01T00:00",
    );
    expect(screen.getByTestId(`${testId}-done`)).not.toBeChecked();
  });

  test("checks the Done box when initialContents has done set to true", async () => {
    renderForm({
      initialContents:
        recommendationRequestFixtures.threeRecommendationRequests[1],
    });

    expect(await screen.findByTestId(`${testId}-done`)).toBeChecked();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("2");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();

    fireEvent.click(await screen.findByTestId(`${testId}-cancel`));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows required messages when submitting an empty form", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Requested is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Needed is required.")).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows error messages for invalid email addresses", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "phtcon@ucsb" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email must be a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor Email must be a valid email address."),
    ).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows error messages for text longer than 255 characters", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "a".repeat(247) + "@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "b".repeat(247) + "@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "c".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(
        "Requester Email has a max length of 255 characters.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor Email has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Explanation has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("accepts text that is exactly 255 characters long", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "a".repeat(246) + "@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "c".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/max length/)).not.toBeInTheDocument();
  });

  test("shows an error when Date Needed is before Date Requested", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2022-04-20T09:59" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Date Needed must not be before Date Requested."),
    ).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("accepts Date Needed equal to Date Requested", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2022-04-20T10:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(
      screen.queryByText("Date Needed must not be before Date Requested."),
    ).not.toBeInTheDocument();
  });

  test("does not compare dates when Date Requested is missing", async () => {
    renderForm();
    await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2022-05-01T10:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Date Requested is required."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Date Needed must not be before Date Requested."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Date Needed is required."),
    ).not.toBeInTheDocument();
  });

  test("calls submitAction with the form data on good input", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.click(screen.getByTestId(`${testId}-done`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      dateRequested: "2022-04-20T10:00",
      dateNeeded: "2022-05-01T10:00",
      done: true,
    });
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be/)).not.toBeInTheDocument();
  });
});
