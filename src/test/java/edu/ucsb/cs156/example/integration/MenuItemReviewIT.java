package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewIT {
  @Autowired public CurrentUserService currentUserService;
  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;
  @Autowired MenuItemReviewRepository menuItemReviewRepository;
  @Autowired public MockMvc mockMvc;
  @Autowired public ObjectMapper mapper;
  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_menu_item_review() throws Exception {
    // arrange
    assertEquals(0, menuItemReviewRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/MenuItemReview/post")
                    .param("itemId", "7")
                    .param("reviewerEmail", "cgaucho@ucsb.edu")
                    .param("stars", "5")
                    .param("dateReviewed", "2022-01-03T00:00:00")
                    .param("comments", "great")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: the review was really saved in the database
    assertEquals(1, menuItemReviewRepository.count());
    MenuItemReview saved = menuItemReviewRepository.findAll().iterator().next();
    assertEquals(7L, saved.getItemId());
    assertEquals("cgaucho@ucsb.edu", saved.getReviewerEmail());
    assertEquals(5, saved.getStars());
    assertEquals(LocalDateTime.parse("2022-01-03T00:00:00"), saved.getDateReviewed());
    assertEquals("great", saved.getComments());

    // assert: the response matches what is in the database
    String expectedJson = mapper.writeValueAsString(saved);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void a_regular_user_cannot_post_a_new_menu_item_review() throws Exception {
    // act
    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "7")
                .param("reviewerEmail", "cgaucho@ucsb.edu")
                .param("stars", "5")
                .param("dateReviewed", "2022-01-03T00:00:00")
                .param("comments", "great")
                .with(csrf()))
        .andExpect(status().is(403));

    // assert: nothing was saved
    assertEquals(0, menuItemReviewRepository.count());
  }
}
