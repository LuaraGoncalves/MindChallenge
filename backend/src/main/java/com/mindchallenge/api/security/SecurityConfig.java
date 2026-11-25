package com.mindchallenge.api.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;

@Configuration
public class SecurityConfig {
	@Bean
	UserDetailsService adminUser(@Value("${app.admin.username}") String username,
			@Value("${app.admin.password}") String password) {
		if (username.isBlank() && password.isBlank()) return new InMemoryUserDetailsManager(List.of());
		if (username.isBlank() || password.length() < 12 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
			throw new IllegalStateException("Configure ADMIN_USERNAME e ADMIN_PASSWORD com 12 a 72 bytes.");
		}
		return new InMemoryUserDetailsManager(User.withUsername(username)
				.password("{bcrypt}" + new BCryptPasswordEncoder(12).encode(password)).roles("ADMIN").build());
	}

	@Bean
	SecurityFilterChain security(HttpSecurity http) throws Exception {
		http.cors(cors -> {})
			.csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository())
				.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
				.ignoringRequestMatchers("/api/rankings"))
			.requestCache(cache -> cache.requestCache(new NullRequestCache()))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/admin/csrf", "/api/admin/login").permitAll()
				.requestMatchers("/api/admin/**").hasRole("ADMIN")
				.anyRequest().permitAll())
			.exceptionHandling(errors -> errors
				.authenticationEntryPoint((request, response, exception) -> {
					response.setStatus(401); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					response.getWriter().write("{\"message\":\"Entre com sua conta de administrador.\"}");
				})
				.accessDeniedHandler((request, response, exception) -> {
					response.setStatus(403); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					response.getWriter().write("{\"message\":\"Acesso negado ou sessao expirada. Atualize a pagina.\"}");
				}))
			.formLogin(form -> form.loginPage("/admin").loginProcessingUrl("/api/admin/login")
				.successHandler((request, response, authentication) -> {
					response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					response.getWriter().write("{\"authenticated\":true}");
				})
				.failureHandler((request, response, exception) -> {
					response.setStatus(401); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					response.getWriter().write("{\"message\":\"Usuario ou senha invalidos.\"}");
				}))
			.logout(logout -> logout.logoutUrl("/api/admin/logout").invalidateHttpSession(true)
				.deleteCookies("JSESSIONID").logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
			.addFilterBefore(new AdminLoginRateLimitFilter(), UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}
