package com.mindchallenge.api.controller;

import java.util.Map;
import java.util.regex.Pattern;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.mindchallenge.infrastructure.persistence.JpaPlayerAccountRepository;
import com.mindchallenge.infrastructure.persistence.PlayerAccountEntity;

@RestController
@RequestMapping("/api/auth")
public class PlayerAccountController {
	public record Credentials(String username, String password) {}
	private static final Pattern USERNAME = Pattern.compile("[A-Za-z0-9_.-]{3,30}");
	private final JpaPlayerAccountRepository accounts;
	private final PasswordEncoder encoder;
	private final AuthenticationManager authenticationManager;
	private final HttpSessionSecurityContextRepository contexts = new HttpSessionSecurityContextRepository();

	public PlayerAccountController(JpaPlayerAccountRepository accounts, PasswordEncoder encoder, AuthenticationManager authenticationManager) {
		this.accounts = accounts; this.encoder = encoder; this.authenticationManager = authenticationManager;
	}

	@PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
	public Map<String, String> register(@RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
		validate(credentials);
		String username = credentials.username().trim();
		if (accounts.existsByUsername(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse nome já está em uso.");
		accounts.save(new PlayerAccountEntity(username, "{bcrypt}" + encoder.encode(credentials.password())));
		return login(new Credentials(username, credentials.password()), request, response);
	}

	@PostMapping("/login")
	public Map<String, String> login(@RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
		try {
			Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(credentials.username().trim(), credentials.password()));
			request.getSession(true);
			request.changeSessionId();
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(authentication);
			SecurityContextHolder.setContext(context);
			contexts.saveContext(context, request, response);
			return Map.of("username", authentication.getName());
		} catch (BadCredentialsException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.");
		}
	}

	@GetMapping("/me")
	public Map<String, String> me(Authentication authentication) { return Map.of("username", authentication.getName()); }

	@PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout(HttpServletRequest request) {
		SecurityContextHolder.clearContext();
		if (request.getSession(false) != null) request.getSession(false).invalidate();
	}

	private void validate(Credentials credentials) {
		if (credentials == null || credentials.username() == null || !USERNAME.matcher(credentials.username().trim()).matches())
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use um nome de 3 a 30 letras, números, ponto, hífen ou sublinhado.");
		if (credentials.password() == null || credentials.password().length() < 12 || credentials.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter pelo menos 12 caracteres e até 72 bytes.");
	}
}
