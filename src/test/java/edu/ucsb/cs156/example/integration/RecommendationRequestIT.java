package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
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
public class RecommendationRequestIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  private RecommendationRequest saveRecommendationRequest() {
    RecommendationRequest recommendationRequest =
        RecommendationRequest.builder()
            .requesterEmail("cgaucho@ucsb.edu")
            .professorEmail("phtcon@ucsb.edu")
            .explanation("BS/MS program")
            .dateRequested(LocalDateTime.parse("2022-04-20T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-05-01T00:00:00"))
            .done(false)
            .build();

    return recommendationRequestRepository.save(recommendationRequest);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    RecommendationRequest recommendationRequest = saveRecommendationRequest();

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/RecommendationRequest?id=" + recommendationRequest.getId()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(recommendationRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendation_request() throws Exception {
    // arrange

    assertEquals(0, recommendationRequestRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/RecommendationRequest/post")
                    .param("requesterEmail", "ldelplaya@ucsb.edu")
                    .param("professorEmail", "richert@ucsb.edu")
                    .param("explanation", "PhD CS Stanford")
                    .param("dateRequested", "2022-05-20T00:00:00")
                    .param("dateNeeded", "2022-11-15T00:00:00")
                    .param("done", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertEquals(1, recommendationRequestRepository.count());
    RecommendationRequest saved = recommendationRequestRepository.findAll().iterator().next();
    assertEquals("ldelplaya@ucsb.edu", saved.getRequesterEmail());
    assertEquals("richert@ucsb.edu", saved.getProfessorEmail());
    assertEquals("PhD CS Stanford", saved.getExplanation());
    assertEquals(LocalDateTime.parse("2022-05-20T00:00:00"), saved.getDateRequested());
    assertEquals(LocalDateTime.parse("2022-11-15T00:00:00"), saved.getDateNeeded());
    assertEquals(true, saved.getDone());

    String expectedJson = mapper.writeValueAsString(saved);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void a_regular_user_cannot_post_a_new_recommendation_request() throws Exception {
    // act
    mockMvc
        .perform(
            post("/api/RecommendationRequest/post")
                .param("requesterEmail", "ldelplaya@ucsb.edu")
                .param("professorEmail", "richert@ucsb.edu")
                .param("explanation", "PhD CS Stanford")
                .param("dateRequested", "2022-05-20T00:00:00")
                .param("dateNeeded", "2022-11-15T00:00:00")
                .param("done", "true")
                .with(csrf()))
        .andExpect(status().is(403));

    // assert
    assertEquals(0, recommendationRequestRepository.count());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_edit_an_existing_recommendation_request() throws Exception {
    // arrange

    RecommendationRequest original = saveRecommendationRequest();

    RecommendationRequest edited =
        RecommendationRequest.builder()
            .requesterEmail("cgaucho@umail.ucsb.edu")
            .professorEmail("ziad.matni@ucsb.edu")
            .explanation("CS Department BS/MS program")
            .dateRequested(LocalDateTime.parse("2022-04-21T10:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-05-02T17:30:00"))
            .done(true)
            .build();

    String requestBody = mapper.writeValueAsString(edited);

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/RecommendationRequest?id=" + original.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertEquals(1, recommendationRequestRepository.count());
    RecommendationRequest updated =
        recommendationRequestRepository.findById(original.getId()).orElseThrow();
    assertEquals("cgaucho@umail.ucsb.edu", updated.getRequesterEmail());
    assertEquals("ziad.matni@ucsb.edu", updated.getProfessorEmail());
    assertEquals("CS Department BS/MS program", updated.getExplanation());
    assertEquals(LocalDateTime.parse("2022-04-21T10:00:00"), updated.getDateRequested());
    assertEquals(LocalDateTime.parse("2022-05-02T17:30:00"), updated.getDateNeeded());
    assertEquals(true, updated.getDone());

    String expectedJson = mapper.writeValueAsString(updated);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_recommendation_request() throws Exception {
    // arrange

    RecommendationRequest recommendationRequest = saveRecommendationRequest();
    long id = recommendationRequest.getId();
    assertEquals(1, recommendationRequestRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/RecommendationRequest?id=" + id).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertFalse(recommendationRequestRepository.findById(id).isPresent());
    assertEquals(0, recommendationRequestRepository.count());

    Map<String, Object> json = responseToJson(response);
    assertEquals("RecommendationRequest with id %d deleted".formatted(id), json.get("message"));
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> responseToJson(MvcResult result) throws Exception {
    String responseString = result.getResponse().getContentAsString();
    return mapper.readValue(responseString, Map.class);
  }
}
