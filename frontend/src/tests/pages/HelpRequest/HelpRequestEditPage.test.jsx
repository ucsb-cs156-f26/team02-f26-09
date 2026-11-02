import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

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

const testId = "HelpRequestForm";

const renderPage = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <HelpRequestEditPage {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/HelpRequest", { params: { id: 17 } }).timeout();
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
      await screen.findByText("Edit HelpRequest");
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
      axiosMock.onGet("/api/HelpRequest", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s22-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2022-04-20T17:35:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
      });
      axiosMock.onPut("/api/HelpRequest").reply(200, {
        id: 17,
        requesterEmail: "ldelplaya@ucsb.edu",
        teamId: "s22-6pm-4",
        tableOrBreakoutRoom: "11",
        requestTime: "2022-04-21T18:10:00",
        explanation: "Dokku problems",
        solved: true,
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
      expect(screen.getByText("Edit HelpRequest")).toBeInTheDocument();
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

    test("Changes when you click Update", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-requesterEmail`);

      fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
        target: { value: "s22-6pm-4" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
        target: { value: "11" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
        target: { value: "2022-04-21T18:10" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
        target: { value: "Dokku problems" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-solved`));

      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest Updated - id: 17 requesterEmail: ldelplaya@ucsb.edu",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/helprequest",
      });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          teamId: "s22-6pm-4",
          tableOrBreakoutRoom: "11",
          requestTime: "2022-04-21T18:10",
          explanation: "Dokku problems",
          solved: true,
        }),
      ); // posted object
    });

    test("sends unchanged fields as they were loaded", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-explanation`);

      fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
        target: { value: "Need help with Swagger-ui, updated" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s22-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2022-04-20T17:35:00",
        explanation: "Need help with Swagger-ui, updated",
        solved: false,
      });
    });

    test("does not save when the data is invalid", async () => {
      renderPage();

      await screen.findByTestId(`${testId}-requesterEmail`);

      fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
        target: { value: "cgaucho" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      expect(
        await screen.findByText(
          "Requester Email must be a valid email address.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Team Id is required.")).toBeInTheDocument();
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
      expect(screen.getByText("Edit HelpRequest")).toBeInTheDocument();
    });
  });
});
