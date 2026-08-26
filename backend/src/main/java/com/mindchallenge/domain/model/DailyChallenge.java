package com.mindchallenge.domain.model;

import java.time.LocalDate;

public record DailyChallenge(
		LocalDate date,
		String gameSlug,
		String title,
		String description,
		int targetScore,
		int rewardCoins
) {
}
