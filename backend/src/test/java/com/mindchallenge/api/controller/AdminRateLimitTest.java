package com.mindchallenge.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import com.mindchallenge.api.security.AdminLoginRateLimitFilter;

class AdminRateLimitTest {
	@Test void limitsRepeatedLoginAttemptsButKeepsPublicRequestsAvailable() throws Exception {
		var filter = new AdminLoginRateLimitFilter();
		for (int attempt = 1; attempt <= 11; attempt++) {
			var response = new MockHttpServletResponse();
			filter.doFilter(new MockHttpServletRequest("POST", "/api/admin/login"), response,
					(request, result) -> ((MockHttpServletResponse) result).setStatus(401));
			assertEquals(attempt <= 10 ? 401 : 429, response.getStatus());
		}
		var publicResponse = new MockHttpServletResponse();
		filter.doFilter(new MockHttpServletRequest("GET", "/api/games/groups"), publicResponse, (request, response) -> {});
		assertEquals(200, publicResponse.getStatus());
	}
}
