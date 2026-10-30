import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
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

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "RecommendationRequestForm";

  const createdRecommendationRequest = {
    id: 17,
    requesterEmail: "cgaucho@ucsb.edu",
    professorEmail: "phtcon@ucsb.edu",
    explanation: "BS/MS program",
    dateRequested: "2022-04-20T10:00:00",
    dateNeeded: "2022-05-01T10:00:00",
    done: false,
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
          <RecommendationRequestCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const fillInForm = () => {
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

  test("renders without crashing", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New RecommendationRequest"),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    axiosMock
      .onPost("/api/RecommendationRequest/post")
      .reply(202, { ...createdRecommendationRequest, done: true });

    renderPage();
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-done`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].url).toBe(
      "/api/RecommendationRequest/post",
    );
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      dateRequested: "2022-04-20T10:00",
      dateNeeded: "2022-05-01T10:00",
      done: true,
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "New recommendationRequest Created - id: 17 requesterEmail: cgaucho@ucsb.edu",
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/recommendationrequest" });
  });

  test("sends done as false when the Done box is left unchecked", async () => {
    axiosMock
      .onPost("/api/RecommendationRequest/post")
      .reply(202, createdRecommendationRequest);

    renderPage();
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params.done).toBe(false);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      }),
    );
  });

  test("does not send a request or navigate when the form is invalid", async () => {
    renderPage();
    await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Create New RecommendationRequest"),
    ).toBeInTheDocument();
  });

  test("stays on the page after a successful submit when storybook is true", async () => {
    axiosMock
      .onPost("/api/RecommendationRequest/post")
      .reply(202, createdRecommendationRequest);

    renderPage({ storybook: true });
    await screen.findByTestId(`${testId}-requesterEmail`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Create New RecommendationRequest"),
    ).toBeInTheDocument();
  });
});
