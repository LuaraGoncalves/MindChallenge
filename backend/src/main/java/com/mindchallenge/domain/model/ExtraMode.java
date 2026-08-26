package com.mindchallenge.domain.model;

import java.util.List;

public record ExtraMode(
		String slug,
		String title,
		String tag,
		String icon,
		String description,
		List<String> features
) {
}
