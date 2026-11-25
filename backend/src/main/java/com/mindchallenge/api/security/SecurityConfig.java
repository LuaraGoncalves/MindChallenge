package com.mindchallenge.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;

@Configuration
public class SecurityConfig {
	@Bean
	PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}
	@Bean
	SecurityFilterChain security(HttpSecurity http) throws Exception {
		http.cors(cors -> {})
			.csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository())
				.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
			.requestCache(cache -> cache.requestCache(new NullRequestCache()))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/admin/csrf", "/api/admin/login").permitAll()
				.requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
				.requestMatchers("/api/auth/**").permitAll()
				.requestMatchers("/api/admin/**").hasRole("ADMIN")
				.requestMatchers(HttpMethod.POST, "/api/rankings").authenticated()
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
