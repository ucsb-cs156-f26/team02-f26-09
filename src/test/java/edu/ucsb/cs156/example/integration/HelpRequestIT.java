package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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
public class HelpRequestIT {
  @Autowired public CurrentUserService currentUserService;
  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;
  @Autowired HelpRequestRepository helpRequestRepository;
  @Autowired public MockMvc mockMvc;
  @Autowired public ObjectMapper mapper;
  @MockitoBean UserRepository userRepository;

  private HelpRequest saveHelpRequest() {
    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("cgaucho@ucsb.edu")
            .teamId("s22-5pm-3")
            .tableOrBreakoutRoom("7")
            .requestTime(LocalDateTime.parse("2022-04-20T17:35:00"))
            .explanation("Need help with Swagger-ui")
            .solved(false)
            .build();

    return helpRequestRepository.save(helpRequest);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    HelpRequest helpRequest = saveHelpRequest();

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/HelpRequest?id=" + helpRequest.getId()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_help_request() throws Exception {
    // arrange

    assertEquals(0, helpRequestRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/HelpRequest/post")
                    .param("requesterEmail", "ldelplaya@ucsb.edu")
                    .param("teamId", "s22-6pm-4")
                    .param("tableOrBreakoutRoom", "11")
                    .param("requestTime", "2022-04-21T18:10:00")
                    .param("explanation", "Dokku problems")
                    .param("solved", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertEquals(1, helpRequestRepository.count());
    HelpRequest saved = helpRequestRepository.findAll().iterator().next();
    assertEquals("ldelplaya@ucsb.edu", saved.getRequesterEmail());
    assertEquals("s22-6pm-4", saved.getTeamId());
    assertEquals("11", saved.getTableOrBreakoutRoom());
    assertEquals(LocalDateTime.parse("2022-04-21T18:10:00"), saved.getRequestTime());
    assertEquals("Dokku problems", saved.getExplanation());
    assertEquals(true, saved.getSolved());

    String expectedJson = mapper.writeValueAsString(saved);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void a_regular_user_cannot_post_a_new_help_request() throws Exception {
    // act
    mockMvc
        .perform(
            post("/api/HelpRequest/post")
                .param("requesterEmail", "ldelplaya@ucsb.edu")
                .param("teamId", "s22-6pm-4")
                .param("tableOrBreakoutRoom", "11")
                .param("requestTime", "2022-04-21T18:10:00")
                .param("explanation", "Dokku problems")
                .param("solved", "true")
                .with(csrf()))
        .andExpect(status().is(403));

    // assert
    assertEquals(0, helpRequestRepository.count());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_edit_an_existing_help_request() throws Exception {
    // arrange

    HelpRequest original = saveHelpRequest();

    HelpRequest edited =
        HelpRequest.builder()
            .requesterEmail("rmorales@ucsb.edu")
            .teamId("s22-7pm-2")
            .tableOrBreakoutRoom("Breakout Room 3")
            .requestTime(LocalDateTime.parse("2022-04-22T19:05:00"))
            .explanation("Merge conflict in pom.xml")
            .solved(true)
            .build();

    String requestBody = mapper.writeValueAsString(edited);

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/HelpRequest?id=" + original.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertEquals(1, helpRequestRepository.count());
    HelpRequest updated = helpRequestRepository.findById(original.getId()).orElseThrow();
    assertEquals("rmorales@ucsb.edu", updated.getRequesterEmail());
    assertEquals("s22-7pm-2", updated.getTeamId());
    assertEquals("Breakout Room 3", updated.getTableOrBreakoutRoom());
    assertEquals(LocalDateTime.parse("2022-04-22T19:05:00"), updated.getRequestTime());
    assertEquals("Merge conflict in pom.xml", updated.getExplanation());
    assertEquals(true, updated.getSolved());

    String expectedJson = mapper.writeValueAsString(updated);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_help_request() throws Exception {
    // arrange

    HelpRequest helpRequest = saveHelpRequest();
    long id = helpRequest.getId();
    assertEquals(1, helpRequestRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/HelpRequest?id=" + id).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assertFalse(helpRequestRepository.findById(id).isPresent());
    assertEquals(0, helpRequestRepository.count());

    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id %d deleted".formatted(id), json.get("message"));
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> responseToJson(MvcResult result) throws Exception {
    String responseString = result.getResponse().getContentAsString();
    return mapper.readValue(responseString, Map.class);
  }
}
