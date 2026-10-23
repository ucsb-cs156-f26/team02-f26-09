import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

const testId = "RecommendationRequestForm";

const renderPage = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <RecommendationRequestEditPage {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

let axiosMock;
describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/RecommendationRequest", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      renderPage();

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit RecommendationRequest");
      expect(
        screen.queryByTestId(`${testId}-requesterEmail`),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/RecommendationRequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "cgaucho@ucsb.edu",
          professorEmail: "phtcon@ucsb.edu",
          explanation: "BS/MS program",
          dateRequested: "2022-04-20T10:00:00",
          dateNeeded: "2022-05-01T10:00:00",
          done: false,
        });
      axiosMock.onPut("/api/RecommendationRequest").reply(200, {
        id: 17,
        requesterEmail: "ldelplaya@ucsb.edu",
        professorEmail: "richert@ucsb.edu",
        explanation: "PhD CS Stanford",
        dateRequested: "2022-05-20T09:00:00",
        dateNeeded: "2022-11-15T17:00:00",
        done: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders without crashing", async () => {
      renderPage();
      await screen.findByText(/Welcome/);
      await screen.findByTestId(`${testId}-requesterEmail`);
      expect(
        screen.getByText("Edit RecommendationRequest"),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent(
        "Update",
      );
    });

    test("Is populated with the data provided", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-requesterEmail`);

      expect(screen.getByTestId(`${testId}-id`)).toHaveValue("17");
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
        "2022-04-20T10:00",
      );
      expect(screen.getByTestId(`${testId}-dateNeeded`)).toHaveValue(
        "2022-05-01T10:00",
      );
      expect(screen.getByTestId(`${testId}-done`)).not.toBeChecked();
    });

    test("Changes when you click Update", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-requesterEmail`);

      fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
        target: { value: "richert@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
        target: { value: "PhD CS Stanford" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
        target: { value: "2022-05-20T09:00" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
        target: { value: "2022-11-15T17:00" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-done`));

      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "RecommendationRequest Updated - id: 17 requesterEmail: ldelplaya@ucsb.edu",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          professorEmail: "richert@ucsb.edu",
          explanation: "PhD CS Stanford",
          dateRequested: "2022-05-20T09:00",
          dateNeeded: "2022-11-15T17:00",
          done: true,
        }),
      ); // posted object
    });

    test("sends unchanged fields as they were loaded", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-explanation`);

      fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
        target: { value: "BS/MS program, updated" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        requesterEmail: "cgaucho@ucsb.edu",
        professorEmail: "phtcon@ucsb.edu",
        explanation: "BS/MS program, updated",
        dateRequested: "2022-04-20T10:00:00",
        dateNeeded: "2022-05-01T10:00:00",
        done: false,
      });
    });

    test("does not save when the data is invalid", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-requesterEmail`);

      fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
        target: { value: "phtcon" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      expect(
        await screen.findByText("Requester Email is required."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Professor Email must be a valid email address."),
      ).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("does not save and goes back when Cancel is clicked", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-explanation`);

      fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
        target: { value: "This change should not be saved" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-cancel`));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("stays on the page after a successful update when storybook is true", async () => {
      renderPage({ storybook: true });

      await screen.findByTestId(`${testId}-explanation`);

      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByText("Edit RecommendationRequest"),
      ).toBeInTheDocument();
    });
  });
});
