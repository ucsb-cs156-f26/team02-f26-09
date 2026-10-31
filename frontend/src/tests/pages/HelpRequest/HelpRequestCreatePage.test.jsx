import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "HelpRequestForm";

  const createdHelpRequest = {
    id: 17,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "s22-5pm-3",
    tableOrBreakoutRoom: "7",
    requestTime: "2022-04-20T17:35:00",
    explanation: "Need help with Swagger-ui",
    solved: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (props = {}) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <HelpRequestCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const fillInForm = () => {
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

  test("renders without crashing", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New HelpRequest"),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    axiosMock
      .onPost("/api/HelpRequest/post")
      .reply(202, { ...createdHelpRequest, solved: true });

    renderPage();
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-solved`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].url).toBe("/api/HelpRequest/post");
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-04-20T17:35",
      explanation: "Need help with Swagger-ui",
      solved: true,
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "New helpRequest Created - id: 17 requesterEmail: cgaucho@ucsb.edu",
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequest" });
  });

  test("sends solved as false when the Solved box is left unchecked", async () => {
    axiosMock.onPost("/api/HelpRequest/post").reply(202, createdHelpRequest);

    renderPage();
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params.solved).toBe(false);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequest" }),
    );
  });

  test("does not send a request or navigate when the form is invalid", async () => {
    renderPage();
    await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team Id is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request Time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });

  test("stays on the page after a successful submit when storybook is true", async () => {
    axiosMock.onPost("/api/HelpRequest/post").reply(202, createdHelpRequest);

    renderPage({ storybook: true });
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });
});
