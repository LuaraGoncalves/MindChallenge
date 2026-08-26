package com.mindchallenge.domain.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.mindchallenge.domain.model.ChallengeGroup;
import com.mindchallenge.domain.model.DailyChallenge;
import com.mindchallenge.domain.model.ExtraMode;
import com.mindchallenge.domain.model.Game;

public interface GameCatalogRepository {
	List<ChallengeGroup> findChallengeGroups();

	List<ExtraMode> findExtraModes();

	Optional<Game> findGameBySlug(String slug);

	DailyChallenge findDailyChallenge(LocalDate date);
}
