import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Explanation",
    "Request Time",
    "Solved",
  ];
  const expectedFields = [
    "id",
    "requesterEmail",
    "teamId",
    "tableOrBreakoutRoom",
    "explanation",
    "requestTime",
    "solved",
  ];
  const testId = "HelpRequestTable";

  const renderTable = (currentUser) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const expectHeadersAndContent = () => {
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("cgaucho@ucsb.edu");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-teamId`),
    ).toHaveTextContent("s22-5pm-3");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-tableOrBreakoutRoom`),
    ).toHaveTextContent("7");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent("Need help with Swagger-ui");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requestTime`),
    ).toHaveTextContent("2022-04-20T17:35:00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("false");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-solved`),
    ).toHaveTextContent("true");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
  };

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(currentUserFixtures.userOnly);

    expectHeadersAndContent();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers, content, and buttons for admin user", () => {
    renderTable(currentUserFixtures.adminUser);

    expectHeadersAndContent();

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveTextContent("Edit");
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent("Delete");
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    renderTable(currentUserFixtures.adminUser);

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`));

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequest/edit/1"),
    );
  });

  test("Delete button calls the delete endpoint for admin user", async () => {
    // arrange
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/HelpRequest")
      .reply(200, { message: "HelpRequest deleted" });

    // act - render the component
    renderTable(currentUserFixtures.adminUser);

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    // act - click the delete button
    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    // assert - check that the delete endpoint was called
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
