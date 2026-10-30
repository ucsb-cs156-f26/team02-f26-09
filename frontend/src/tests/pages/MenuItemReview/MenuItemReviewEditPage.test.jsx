import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("MenuItemReviewEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/MenuItemReview", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
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
        .onGet("/api/MenuItemReview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 27,
          reviewerEmail: "cgaucho@ucsb.edu",
          stars: 3,
          dateReviewed: "2022-03-14T15:00",
          comments: "It was okay",
        });
      axiosMock.onPut("/api/MenuItemReview").reply(200, {
        id: "17",
        itemId: "42",
        reviewerEmail: "ldelplaya@ucsb.edu",
        stars: "5",
        dateReviewed: "2022-12-25T08:00",
        comments: "Much better now",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("MenuItemReviewForm-itemId");
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-itemId");

      expect(screen.getByTestId("MenuItemReviewForm-id")).toHaveValue("17");
      expect(screen.getByTestId("MenuItemReviewForm-itemId")).toHaveValue(27);
      expect(
        screen.getByTestId("MenuItemReviewForm-reviewerEmail"),
      ).toHaveValue("cgaucho@ucsb.edu");
      expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveValue(3);
      expect(screen.getByTestId("MenuItemReviewForm-dateReviewed")).toHaveValue(
        "2022-03-14T15:00",
      );
      expect(screen.getByTestId("MenuItemReviewForm-comments")).toHaveValue(
        "It was okay",
      );
      expect(screen.getByTestId("MenuItemReviewForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-itemId");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
        target: { value: "5" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
        target: { value: "2022-12-25T08:00" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "Much better now" },
      });

      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 reviewerEmail: ldelplaya@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "42",
          reviewerEmail: "ldelplaya@ucsb.edu",
          stars: "5",
          dateReviewed: "2022-12-25T08:00",
          comments: "Much better now",
        }),
      );
    });
  });
});
