package com.mindchallenge.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
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
	PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }
	@Bean
	AuthenticationManager authenticationManager(UserDetailsService users, PasswordEncoder encoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setUserDetailsService(users);
		provider.setPasswordEncoder(encoder);
		return new ProviderManager(provider);
	}
	@Bean
	SecurityFilterChain security(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
		http.cors(cors -> {})
			.authenticationManager(authenticationManager)
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
