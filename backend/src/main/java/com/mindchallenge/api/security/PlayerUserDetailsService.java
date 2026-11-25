package com.mindchallenge.api.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.mindchallenge.infrastructure.persistence.JpaPlayerAccountRepository;

@Service
public class PlayerUserDetailsService implements UserDetailsService {
	private final JpaPlayerAccountRepository accounts;
	private final UserDetails admin;
	public PlayerUserDetailsService(JpaPlayerAccountRepository accounts,
			@Value("${app.admin.username}") String adminName, @Value("${app.admin.password}") String adminPassword) {
		this.accounts = accounts;
		if (adminName.isBlank() && adminPassword.isBlank()) this.admin = null;
		else if (adminName.isBlank() || adminPassword.length() < 12 || adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
			throw new IllegalStateException("Configure ADMIN_USERNAME e ADMIN_PASSWORD com 12 a 72 bytes.");
		else this.admin = User.withUsername(adminName).password("{bcrypt}" + new BCryptPasswordEncoder(12).encode(adminPassword)).roles("ADMIN").build();
	}
	@Override public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		if (admin != null && admin.getUsername().equals(username)) return admin;
		var account = accounts.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Conta não encontrada."));
		return User.withUsername(account.getUsername()).password(account.getPasswordHash()).roles("PLAYER").build();
	}
}
