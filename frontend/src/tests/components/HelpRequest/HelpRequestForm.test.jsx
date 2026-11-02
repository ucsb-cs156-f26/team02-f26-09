import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  const expectedLabels = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time (iso format)",
    "Explanation",
    "Solved",
  ];

  const renderForm = (props = {}) =>
    render(
      <Router>
        <HelpRequestForm {...props} />
      </Router>,
    );

  const fillInValidForm = () => {
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "s22-5pm-3" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2022-04-20T17:35" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with Swagger-ui" },
    });
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: helpRequestFixtures.oneHelpRequest,
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
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue("s22-5pm-3");
    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      "7",
    );
    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue(
      "2022-04-20T17:35",
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      "Need help with Swagger-ui",
    );
    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
  });

  test("checks the Solved box when initialContents has solved set to true", async () => {
    renderForm({
      initialContents: helpRequestFixtures.threeHelpRequests[1],
    });

    expect(await screen.findByTestId(`${testId}-solved`)).toBeChecked();
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
    expect(screen.getByText("Team Id is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request Time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows an error message for an invalid email address", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email must be a valid email address."),
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
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "b".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "c".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "d".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(
        "Requester Email has a max length of 255 characters.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Team Id has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Table or Breakout Room has a max length of 255 characters.",
      ),
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
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "b".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "c".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "d".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/max length/)).not.toBeInTheDocument();
  });

  test("calls submitAction with the form data on good input", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.click(screen.getByTestId(`${testId}-solved`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-04-20T17:35",
      explanation: "Need help with Swagger-ui",
      solved: true,
    });
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be/)).not.toBeInTheDocument();
  });
});
