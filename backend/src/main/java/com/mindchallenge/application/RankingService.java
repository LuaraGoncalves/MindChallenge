package com.mindchallenge.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.mindchallenge.domain.model.RankingEntry;
import com.mindchallenge.domain.repository.RankingRepository;

@Service
public class RankingService {
	private static final int DEFAULT_LIMIT = 10;

	private final RankingRepository repository;
	private final GameCatalogService catalogService;

	public RankingService(RankingRepository repository, GameCatalogService catalogService) {
		this.repository = repository;
		this.catalogService = catalogService;
	}

	public List<RankingEntry> getTopRanking() {
		return repository.findTop(DEFAULT_LIMIT);
	}

	public List<RankingEntry> getTopRankingByGame(String gameSlug) {
		catalogService.getGame(gameSlug);
		return repository.findTopByGame(gameSlug, DEFAULT_LIMIT);
	}

	public RankingEntry submitScore(String playerName, String gameSlug, int score) {
		catalogService.getGame(gameSlug);
		RankingEntry entry = new RankingEntry(UUID.randomUUID(), playerName.trim(), gameSlug, score, Instant.now());
		return repository.save(entry);
	}
}
