package com.mindchallenge.api.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import javax.imageio.ImageIO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
	"app.admin.username=owner-test", "app.admin.password=test-only-password-not-real",
	"app.images.directory=./target/test-images",
	"spring.datasource.url=jdbc:h2:mem:admin-tests;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"
})
@AutoConfigureMockMvc
class AdminCatalogTest {
	@Autowired MockMvc mvc;
	@Autowired ObjectMapper json;

	@Test void rejectsAnonymousAndNonAdminWritesAndRequiresCsrf() throws Exception {
		mvc.perform(get("/api/admin/themes")).andExpect(status().isUnauthorized());
		mvc.perform(post("/api/admin/themes").with(csrf()).contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Private\",\"active\":true}")).andExpect(status().isUnauthorized());
		mvc.perform(post("/api/admin/themes").with(user("viewer").roles("USER")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Private\",\"active\":true}")).andExpect(status().isForbidden());
		mvc.perform(post("/api/admin/themes").with(user("owner-test").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Private\",\"active\":true}")).andExpect(status().isForbidden());
	}

	@Test void logsInWithRealCsrfSessionAndLogsOut() throws Exception {
		var initial = mvc.perform(get("/api/admin/csrf")).andExpect(status().isOk()).andReturn();
		var session = (MockHttpSession) initial.getRequest().getSession(false);
		var token = json.readTree(initial.getResponse().getContentAsString());
		mvc.perform(post("/api/admin/login").session(session)
				.header(token.get("headerName").asText(), token.get("token").asText())
				.param("username", "owner-test").param("password", "test-only-password-not-real"))
				.andExpect(status().isOk());
		mvc.perform(get("/api/admin/me").session(session)).andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("owner-test"));
		mvc.perform(post("/api/admin/themes").session(session)
				.header(token.get("headerName").asText(), token.get("token").asText())
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Old token\",\"active\":true}"))
				.andExpect(status().isForbidden());
		var renewed = mvc.perform(get("/api/admin/csrf").session(session)).andExpect(status().isOk()).andReturn();
		var fresh = json.readTree(renewed.getResponse().getContentAsString());
		mvc.perform(post("/api/admin/themes").session(session)
				.header(fresh.get("headerName").asText(), fresh.get("token").asText())
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Session collection\",\"active\":true}"))
				.andExpect(status().isCreated());
		mvc.perform(post("/api/admin/logout").session(session).with(csrf())).andExpect(status().isNoContent());
		assertTrue(session.isInvalid());
		mvc.perform(get("/api/admin/me")).andExpect(status().isUnauthorized());
		mvc.perform(post("/api/admin/login").with(csrf()).param("username", "owner-test").param("password", "incorrect"))
				.andExpect(status().isUnauthorized());
	}

	@Test void persistsThemesAndCharactersAndPublishesOnlyActiveItems() throws Exception {
		String theme = createTheme("Anime collection");
		String characterId = "";
		for (int index = 0; index < 7; index++) {
			var result = mvc.perform(post("/api/admin/characters").with(user("owner-test").roles("ADMIN")).with(csrf())
					.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of(
							"name", "Hero " + index, "themeId", theme, "imageUrl", "https://images.example/" + index + ".png", "active", index < 6))))
					.andExpect(status().isCreated()).andReturn();
			if (index == 0) characterId = json.readTree(result.getResponse().getContentAsString()).get("id").asText();
		}
		mvc.perform(get("/api/memory/themes/" + theme + "/characters?count=6"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(6));
		mvc.perform(get("/api/memory/themes/" + theme + "/characters?count=8")).andExpect(status().isBadRequest());
		mvc.perform(delete("/api/admin/themes/" + theme).with(user("owner-test").roles("ADMIN")).with(csrf())).andExpect(status().isBadRequest());
		mvc.perform(put("/api/admin/characters/" + characterId).with(user("owner-test").roles("ADMIN")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("name", "Updated hero", "themeId", theme,
						"imageUrl", "https://images.example/new.png", "active", false)))).andExpect(status().isOk());
		mvc.perform(get("/api/memory/themes/" + theme + "/characters?count=6")).andExpect(status().isBadRequest());
		mvc.perform(put("/api/admin/themes/" + theme).with(user("owner-test").roles("ADMIN")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Hidden collection\",\"active\":false}")).andExpect(status().isOk());
		mvc.perform(get("/api/memory/themes/" + theme + "/characters?count=6")).andExpect(status().isNotFound());
		mvc.perform(delete("/api/admin/characters/" + characterId).with(user("owner-test").roles("ADMIN")).with(csrf())).andExpect(status().isNoContent());
	}

	@Test void validatesImageUrlsAndThemeDeletion() throws Exception {
		String theme = createTheme("Disposable collection");
		mvc.perform(post("/api/admin/characters").with(user("owner-test").roles("ADMIN")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("name", "Invalid", "themeId", theme,
						"imageUrl", "javascript:alert(1)", "active", true)))).andExpect(status().isBadRequest());
		mvc.perform(delete("/api/admin/themes/" + theme).with(user("owner-test").roles("ADMIN")).with(csrf())).andExpect(status().isNoContent());
		mvc.perform(put("/api/admin/themes/" + theme).with(user("owner-test").roles("ADMIN")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Missing\",\"active\":true}")).andExpect(status().isNotFound());
	}

	@Test void acceptsOnlyDecodedImagesAndServesUploadedPngWithoutLogin() throws Exception {
		var fake = new MockMultipartFile("file", "fake.png", "image/png", "<svg><script/></svg>".getBytes());
		mvc.perform(multipart("/api/admin/images").file(fake).with(user("owner-test").roles("ADMIN")).with(csrf())).andExpect(status().isBadRequest());
		var bytes = new ByteArrayOutputStream();
		ImageIO.write(new BufferedImage(8, 8, BufferedImage.TYPE_INT_RGB), "png", bytes);
		var valid = new MockMultipartFile("file", "photo.png", "image/png", bytes.toByteArray());
		mvc.perform(multipart("/api/admin/images").file(valid).with(csrf())).andExpect(status().isUnauthorized());
		var upload = mvc.perform(multipart("/api/admin/images").file(valid).with(user("owner-test").roles("ADMIN")).with(csrf()))
				.andExpect(status().isOk()).andReturn();
		String url = json.readTree(upload.getResponse().getContentAsString()).get("url").asText();
		mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentType(MediaType.IMAGE_PNG));
	}

	private String createTheme(String name) throws Exception {
		var response = mvc.perform(post("/api/admin/themes").with(user("owner-test").roles("ADMIN")).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("name", name, "active", true))))
				.andExpect(status().isCreated()).andReturn();
		return json.readTree(response.getResponse().getContentAsString()).get("id").asText();
	}
}
