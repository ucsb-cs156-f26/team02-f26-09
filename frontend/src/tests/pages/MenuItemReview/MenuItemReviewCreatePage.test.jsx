import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
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

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const review = {
      id: 17,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-02-02T00:00",
      comments: "Pretty good",
    };

    axiosMock.onPost("/api/MenuItemReview/post").reply(202, review);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
      target: { value: "Pretty good" },
    });

    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "27",
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: "4",
      dateReviewed: "2022-02-02T00:00",
      comments: "Pretty good",
    });

    expect(mockToast).toBeCalledWith(
      "New menuItemReview Created - id: 17 reviewerEmail: cgaucho@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });
});
