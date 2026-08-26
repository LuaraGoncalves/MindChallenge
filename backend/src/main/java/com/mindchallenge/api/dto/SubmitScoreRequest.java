package com.mindchallenge.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitScoreRequest(
		@NotBlank
		@Size(max = 40)
		String playerName,

		@NotBlank
		@Size(max = 60)
		String gameSlug,

		@Min(0)
		@Max(999999)
		int score
) {
}
