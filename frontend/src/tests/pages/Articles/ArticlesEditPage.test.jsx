import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
      id: 1,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 1 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("ArticlesForm-id")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const testId = "ArticlesForm";
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
      axiosMock.onGet("/api/articles", { params: { id: 1 } }).reply(200, {
        id: 1,
        title: "Are baked beans a healthy meal?",
        url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
        email: "cgaucho@ucsb.edu",
        explanation: "What makes a healthy can of baked beans?",
        dateAdded: "2026-10-29T10:30Z",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 1,
        title: "Baked Beans!",
        url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
        email: "cgaucho@ucsb.edu",
        explanation: "What makes a healthy can of baked beans?",
        dateAdded: "2026-10-29T10:30Z",
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId(`${testId}-id`);
      expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-id`);

      const idField = screen.getByTestId(`${testId}-id`);
      const titleField = screen.getByTestId(`${testId}-title`);
      const urlField = screen.getByTestId(`${testId}-url`);
      const emailField = screen.getByTestId(`${testId}-email`);
      const explanationField = screen.getByTestId(`${testId}-explanation`);
      const dateAddedField = screen.getByTestId(`${testId}-dateAdded`);

      const submitButton = screen.getByTestId(`${testId}-submit`);

      expect(idField).toHaveValue("1");
      expect(titleField).toHaveValue("Are baked beans a healthy meal?");
      expect(urlField).toHaveValue(
        "https://www.nzherald.co.nz/lifestyle/baked-beans/",
      );
      expect(emailField).toHaveValue("cgaucho@ucsb.edu");
      expect(explanationField).toHaveValue(
        "What makes a healthy can of baked beans?",
      );
      expect(dateAddedField).toHaveValue("2026-10-29T10:30");

      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-id`);

      const idField = screen.getByTestId(`${testId}-id`);
      const titleField = screen.getByTestId(`${testId}-title`);
      const urlField = screen.getByTestId(`${testId}-url`);
      const emailField = screen.getByTestId(`${testId}-email`);
      const explanationField = screen.getByTestId(`${testId}-explanation`);
      const dateAddedField = screen.getByTestId(`${testId}-dateAdded`);

      const submitButton = screen.getByTestId(`${testId}-submit`);

      expect(idField).toHaveValue("1");
      expect(titleField).toHaveValue("Are baked beans a healthy meal?");
      expect(urlField).toHaveValue(
        "https://www.nzherald.co.nz/lifestyle/baked-beans/",
      );
      expect(emailField).toHaveValue("cgaucho@ucsb.edu");
      expect(explanationField).toHaveValue(
        "What makes a healthy can of baked beans?",
      );
      expect(dateAddedField).toHaveValue("2026-10-29T10:30");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(screen.getByTestId(`${testId}-title`), {
        target: { value: "Baked Beans!" }, // ? -> ! changed
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

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 1 title: Baked Beans!",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Baked Beans!",
          url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
          email: "cgaucho@ucsb.edu",
          explanation: "What makes a healthy can of baked beans?",
          dateAdded: "2026-10-29T10:30:00Z",
        }),
      ); // posted object
    });
  });
});
