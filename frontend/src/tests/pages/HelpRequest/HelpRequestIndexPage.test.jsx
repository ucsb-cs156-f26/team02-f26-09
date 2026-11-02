import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockedNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "HelpRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Renders with Create Button for admin user", async () => {
    // arrange
    setupAdminUser();
    axiosMock.onGet("/api/HelpRequest/all").reply(200, []);

    // act
    renderPage();

    // assert
    await waitFor(() => {
      expect(screen.getByText(/Create HelpRequest/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create HelpRequest/);
    expect(button).toHaveAttribute("href", "/helprequest/create");
    expect(button).toHaveAttribute("style", "float: right;");
    expect(screen.getByText("HelpRequests")).toBeInTheDocument();
  });

  test("renders three help requests correctly for regular user", async () => {
    // arrange
    setupUserOnly();
    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    // act
    renderPage();

    // assert
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("cgaucho@ucsb.edu");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-teamId`),
    ).toHaveTextContent("s22-6pm-4");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-tableOrBreakoutRoom`),
    ).toHaveTextContent("Breakout Room 3");
    expect(screen.getByText("HelpRequests")).toBeInTheDocument();

    // regular users can see the data, but not the create, edit, or delete buttons
    expect(screen.queryByText(/Create HelpRequest/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    // arrange
    setupUserOnly();
    axiosMock.onGet("/api/HelpRequest/all").timeout();
    const restoreConsole = mockConsole();

    // act
    renderPage();

    // assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/HelpRequest/all",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    // arrange
    setupAdminUser();
    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    // act
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`));

    // assert
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequest/edit/2"),
    );
  });

  test("what happens when you click delete, admin", async () => {
    // arrange
    setupAdminUser();
    const [first, ...rest] = helpRequestFixtures.threeHelpRequests;
    axiosMock.onGet("/api/HelpRequest/all").replyOnce(200, [first, ...rest]);
    axiosMock.onGet("/api/HelpRequest/all").reply(200, rest);
    axiosMock
      .onDelete("/api/HelpRequest")
      .reply(200, { message: "HelpRequest with id 1 deleted" });

    // act
    renderPage();

    // assert
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act
    fireEvent.click(deleteButton);

    // assert
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("HelpRequest with id 1 deleted");
    });
    expect(axiosMock.history.delete.length).toBe(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    // the table is refreshed and no longer shows the deleted record
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });
    expect(
      screen.queryByTestId(`${testId}-cell-row-2-col-id`),
    ).not.toBeInTheDocument();
  });
});
