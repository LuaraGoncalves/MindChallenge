package com.mindchallenge.api.security;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

public class AdminLoginRateLimitFilter extends OncePerRequestFilter {
	private record Attempts(long expiresAt, int count) {}
	private final ConcurrentHashMap<String, Attempts> attempts = new ConcurrentHashMap<>();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String path = request.getRequestURI().substring(request.getContextPath().length());
		boolean login = path.equals("/api/admin/login") || path.equals("/api/auth/login") || path.equals("/api/auth/register");
		if (!login || !request.getMethod().equals("POST")) {
			chain.doFilter(request, response); return;
		}
		long now = System.currentTimeMillis();
		attempts.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
		if (attempts.size() >= 1000 && !attempts.containsKey(request.getRemoteAddr())) {
			response.setStatus(429); return;
		}
		Attempts current = attempts.compute(request.getRemoteAddr(), (key, previous) -> previous == null
				? new Attempts(now + 60000, 1) : new Attempts(previous.expiresAt(), previous.count() + 1));
		if (current.count() > 10) {
			response.setStatus(429); response.setHeader("Retry-After", "60");
			response.setContentType("application/json");
			response.getWriter().write("{\"message\":\"Muitas tentativas. Aguarde um minuto.\"}"); return;
		}
		chain.doFilter(request, response);
	}
}
