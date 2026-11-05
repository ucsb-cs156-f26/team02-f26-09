package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_and_delete_menu_item_review() throws Exception {
    setupUser(true);

    // go to the MenuItemReview index page from the navbar
    page.getByText("MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();

    // open the create form
    page.getByText("Create MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();
    assertThat(page.getByTestId("MenuItemReviewForm-itemId")).isVisible();

    // fill in the form and submit
    page.getByTestId("MenuItemReviewForm-itemId").fill("7");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("MenuItemReviewForm-stars").fill("5");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2022-01-03T00:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("great");
    page.getByTestId("MenuItemReviewForm-submit").click();

    // the new review shows up in the table
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).hasText("great");
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .hasText("cgaucho@ucsb.edu");

    // delete it and make sure it is gone
    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_menu_item_review() throws Exception {
    setupUser(false);

    page.getByText("MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByText("Create MenuItemReview", new Page.GetByTextOptions().setExact(true)))
        .not()
        .isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }
}
