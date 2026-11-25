package com.mindchallenge.api.controller;

import java.security.Principal;
import java.util.Map;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminSessionController {
	@GetMapping("/api/admin/csrf")
	public Map<String, String> csrf(CsrfToken token) {
		return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
	}

	@GetMapping("/api/admin/me")
	public Map<String, String> currentAdmin(Principal principal) {
		return Map.of("username", principal.getName());
	}
}
