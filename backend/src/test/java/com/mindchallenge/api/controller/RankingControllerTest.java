package com.mindchallenge.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RankingControllerTest {
	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldSubmitScore() throws Exception {
		mockMvc.perform(post("/api/rankings")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "playerName": "Luara",
								  "gameSlug": "memory-kids",
								  "score": 1990
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.playerName").value("Luara"))
				.andExpect(jsonPath("$.score").value(1990));
	}

	@Test
	void shouldValidateScorePayload() throws Exception {
		mockMvc.perform(post("/api/rankings")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "playerName": "",
								  "gameSlug": "memory-kids",
								  "score": -1
								}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}
}
