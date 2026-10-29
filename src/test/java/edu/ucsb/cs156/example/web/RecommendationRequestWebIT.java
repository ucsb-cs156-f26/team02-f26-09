package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  private void goToRecommendationRequestIndexPage() {
    page.getByRole(
            AriaRole.LINK,
            new Page.GetByRoleOptions().setName("RecommendationRequest").setExact(true))
        .click();
    assertThat(page.getByText("RecommendationRequests", new Page.GetByTextOptions().setExact(true)))
        .isVisible();
  }

  @Test
  public void admin_user_can_create_edit_delete_recommendation_request() throws Exception {
    setupUser(true);

    goToRecommendationRequestIndexPage();

    page.getByText("Create RecommendationRequest").click();
    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("phtcon@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("BS/MS program");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2022-04-20T10:00");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2022-05-01T17:30");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("cgaucho@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-professorEmail"))
        .hasText("phtcon@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("BS/MS program");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-dateRequested"))
        .hasText("2022-04-20T10:00:00");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-dateNeeded"))
        .hasText("2022-05-01T17:30:00");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-done")).hasText("false");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit RecommendationRequest")).isVisible();
    page.getByTestId("RecommendationRequestForm-explanation").fill("PhD CS Stanford");
    page.getByTestId("RecommendationRequestForm-done").check();
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("PhD CS Stanford");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-done")).hasText("true");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendation_request() throws Exception {
    setupUser(false);

    goToRecommendationRequestIndexPage();

    assertThat(page.getByText("Create RecommendationRequest")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_can_see_but_not_edit_or_delete_recommendation_requests()
      throws Exception {
    RecommendationRequest recommendationRequest =
        RecommendationRequest.builder()
            .requesterEmail("ldelplaya@ucsb.edu")
            .professorEmail("richert@ucsb.edu")
            .explanation("PhD CS Stanford")
            .dateRequested(LocalDateTime.parse("2022-05-20T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-11-15T00:00:00"))
            .done(true)
            .build();
    recommendationRequestRepository.save(recommendationRequest);

    setupUser(false);

    goToRecommendationRequestIndexPage();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("ldelplaya@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("PhD CS Stanford");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button"))
        .not()
        .isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button"))
        .not()
        .isVisible();
  }
}
