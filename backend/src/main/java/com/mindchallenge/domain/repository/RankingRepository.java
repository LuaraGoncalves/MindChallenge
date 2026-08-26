package com.mindchallenge.domain.repository;

import java.util.List;

import com.mindchallenge.domain.model.RankingEntry;

public interface RankingRepository {
	RankingEntry save(RankingEntry entry);

	List<RankingEntry> findTop(int limit);

	List<RankingEntry> findTopByGame(String gameSlug, int limit);
}
