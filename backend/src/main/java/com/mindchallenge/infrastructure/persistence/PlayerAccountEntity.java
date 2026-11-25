package com.mindchallenge.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "player_accounts")
public class PlayerAccountEntity {
	@Id @Column(length = 36) private String id;
	@Column(length = 30, nullable = false, unique = true) private String username;
	@Column(name = "password_hash", length = 100, nullable = false) private String passwordHash;
	@Column(name = "created_at", nullable = false) private Instant createdAt;
	protected PlayerAccountEntity() {}
	public PlayerAccountEntity(String username, String passwordHash) {
		this.id = UUID.randomUUID().toString(); this.username = username; this.passwordHash = passwordHash; this.createdAt = Instant.now();
	}
	public String getUsername() { return username; }
	public String getPasswordHash() { return passwordHash; }
}
