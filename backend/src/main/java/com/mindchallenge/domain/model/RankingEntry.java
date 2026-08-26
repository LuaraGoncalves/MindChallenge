package com.mindchallenge.domain.model;

import java.time.Instant;
import java.util.UUID;

public record RankingEntry(
		UUID id,
		String playerName,
		String gameSlug,
		int score,
		Instant createdAt
) {
}
