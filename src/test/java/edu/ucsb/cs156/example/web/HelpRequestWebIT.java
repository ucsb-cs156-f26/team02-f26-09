package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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
public class HelpRequestWebIT extends WebTestCase {

  @Autowired HelpRequestRepository helpRequestRepository;

  private void goToHelpRequestIndexPage() {
    page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("HelpRequest").setExact(true))
        .click();
    assertThat(page.getByText("HelpRequests", new Page.GetByTextOptions().setExact(true)))
        .isVisible();
  }

  @Test
  public void admin_user_can_create_edit_delete_help_request() throws Exception {
    setupUser(true);

    goToHelpRequestIndexPage();

    page.getByText("Create HelpRequest").click();
    assertThat(page.getByText("Create New HelpRequest")).isVisible();
    page.getByTestId("HelpRequestForm-requesterEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("HelpRequestForm-teamId").fill("s22-5pm-3");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("7");
    page.getByTestId("HelpRequestForm-requestTime").fill("2022-04-20T17:35");
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with Swagger-ui");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("cgaucho@ucsb.edu");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-teamId")).hasText("s22-5pm-3");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-tableOrBreakoutRoom"))
        .hasText("7");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requestTime"))
        .hasText("2022-04-20T17:35:00");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with Swagger-ui");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved")).hasText("false");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit HelpRequest")).isVisible();
    page.getByTestId("HelpRequestForm-explanation").fill("Dokku problems");
    page.getByTestId("HelpRequestForm-solved").check();
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Dokku problems");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved")).hasText("true");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_help_request() throws Exception {
    setupUser(false);

    goToHelpRequestIndexPage();

    assertThat(page.getByText("Create HelpRequest")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_can_see_but_not_edit_or_delete_help_requests() throws Exception {
    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("ldelplaya@ucsb.edu")
            .teamId("s22-6pm-4")
            .tableOrBreakoutRoom("13")
            .requestTime(LocalDateTime.parse("2022-04-21T14:15:00"))
            .explanation("Merge conflict")
            .solved(true)
            .build();
    helpRequestRepository.save(helpRequest);

    setupUser(false);

    goToHelpRequestIndexPage();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("ldelplaya@ucsb.edu");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Merge conflict");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved")).hasText("true");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button")).not().isVisible();
  }
}
