package com.mindchallenge.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;

import com.mindchallenge.domain.model.RankingEntry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ranking_entries")
public class RankingEntryEntity {
	@Id
	@Column(length = 36, nullable = false)
	private String id;

	@Column(name = "player_name", length = 40, nullable = false)
	private String playerName;

	@Column(name = "game_slug", length = 60, nullable = false)
	private String gameSlug;

	@Column(nullable = false)
	private int score;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected RankingEntryEntity() {
	}

	private RankingEntryEntity(String id, String playerName, String gameSlug, int score, Instant createdAt) {
		this.id = id;
		this.playerName = playerName;
		this.gameSlug = gameSlug;
		this.score = score;
		this.createdAt = createdAt;
	}

	public static RankingEntryEntity fromDomain(RankingEntry entry) {
		return new RankingEntryEntity(
				entry.id().toString(),
				entry.playerName(),
				entry.gameSlug(),
				entry.score(),
				entry.createdAt()
		);
	}

	public RankingEntry toDomain() {
		return new RankingEntry(
				UUID.fromString(id),
				playerName,
				gameSlug,
				score,
				createdAt
		);
	}
}
