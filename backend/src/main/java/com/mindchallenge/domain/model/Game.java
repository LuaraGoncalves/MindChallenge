package com.mindchallenge.domain.model;

public record Game(
		String slug,
		String name,
		String description,
		String icon,
		String skill,
		Difficulty difficulty,
		int estimatedMinutes
) {
}
