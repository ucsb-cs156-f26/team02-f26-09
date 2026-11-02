import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "ArticlesForm";

  const createdArticle = {
    id: 17,
    title: "Are baked beans a healthy meal?",
    url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
    explanation: "What makes a healthy can of baked beans?",
    email: "cgaucho@ucsb.edu",
    dateAdded: "2026-10-29T10:30:00Z",
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
          <ArticlesCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const fillInForm = () => {
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Are baked beans a healthy meal?" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://www.nzherald.co.nz/lifestyle/baked-beans/" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "What makes a healthy can of baked beans?" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2026-10-29T10:30" },
    });
  };

  test("renders without crashing", async () => {
    renderPage();

    expect(await screen.findByText("Create New Article")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-title`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    axiosMock.onPost("/api/articles/post").reply(202, createdArticle);

    renderPage();
    await screen.findByTestId(`${testId}-title`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].url).toBe("/api/articles/post");
    expect(axiosMock.history.post[0].params).toEqual({
      title: "Are baked beans a healthy meal?",
      url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
      explanation: "What makes a healthy can of baked beans?",
      email: "cgaucho@ucsb.edu",
      dateAdded: "2026-10-29T10:30:00Z",
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "New article Created - id: 17 title: Are baked beans a healthy meal?",
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
  });

  test("does not send a request or navigate when the form is invalid", async () => {
    renderPage();
    await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("stays on the page after a successful submit when storybook is true", async () => {
    axiosMock.onPost("/api/articles/post").reply(202, createdArticle);

    renderPage({ storybook: true });
    await screen.findByTestId(`${testId}-title`);

    fillInForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });
});
