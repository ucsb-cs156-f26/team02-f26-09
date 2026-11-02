import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const testId = "ArticlesForm";

  const expectedLabels = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added (UTC)",
  ];

  const renderForm = (props = {}) =>
    render(
      <Router>
        <ArticlesForm {...props} />
      </Router>,
    );

  const fillInValidForm = () => {
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

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: articlesFixtures.oneArticle,
      buttonLabel: "Update",
    });

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );
    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle.explanation,
    );
    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle.email,
    );
    // "2026-10-29T05:26:03Z" from the API is shown without the zone
    // (jsdom normalizes it to "...:03.000"; browsers show "...:03")
    expect(screen.getByTestId(`${testId}-dateAdded`).value).toMatch(
      /^2026-10-29T05:26:03/,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();

    fireEvent.click(await screen.findByTestId(`${testId}-cancel`));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows required messages when submitting an empty form", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("URL is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Added is required.")).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows error messages for an invalid URL and email", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "www.nzherald.co.nz" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "cgaucho@ucsb" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("URL must start with http:// or https://"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Email must be a valid email address."),
    ).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows error messages for text longer than 255 characters", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://" + "b".repeat(248) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "c".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "d".repeat(247) + "@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Title has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("URL has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Explanation has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Email has a max length of 255 characters."),
    ).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("accepts text that is exactly 255 characters long", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://" + "b".repeat(247) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "c".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "d".repeat(246) + "@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/max length/)).not.toBeInTheDocument();
  });

  test("submits the data with dateAdded converted to a UTC ISO string", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });
    await screen.findByTestId(`${testId}-submit`);

    fillInValidForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      title: "Are baked beans a healthy meal?",
      url: "https://www.nzherald.co.nz/lifestyle/baked-beans/",
      explanation: "What makes a healthy can of baked beans?",
      email: "cgaucho@ucsb.edu",
      dateAdded: "2026-10-29T10:30:00Z",
    });
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must/)).not.toBeInTheDocument();
  });

  test("keeps the loaded dateAdded unchanged when editing other fields", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({
      initialContents: articlesFixtures.oneArticle,
      submitAction: mockSubmitAction,
      buttonLabel: "Update",
    });
    await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Baked beans, revisited" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      ...articlesFixtures.oneArticle,
      title: "Baked beans, revisited",
      dateAdded: "2026-10-29T05:26:03Z",
    });
  });
});
