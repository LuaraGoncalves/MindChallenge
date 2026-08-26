package com.mindchallenge.domain.model;

import java.util.List;

public record ChallengeGroup(
		String slug,
		String title,
		String description,
		String icon,
		String audience,
		List<Game> games
) {
}
