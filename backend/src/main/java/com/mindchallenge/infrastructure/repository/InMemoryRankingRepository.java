package com.mindchallenge.infrastructure.repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.mindchallenge.domain.model.RankingEntry;
import com.mindchallenge.domain.repository.RankingRepository;

@Repository
public class InMemoryRankingRepository implements RankingRepository {
	private final List<RankingEntry> entries = new ArrayList<>();

	public InMemoryRankingRepository() {
		entries.addAll(List.of(
				new RankingEntry(java.util.UUID.randomUUID(), "Luna", "memory-kids", 1840, java.time.Instant.now().minusSeconds(8400)),
				new RankingEntry(java.util.UUID.randomUUID(), "Pixel", "math-rush", 2760, java.time.Instant.now().minusSeconds(6200)),
				new RankingEntry(java.util.UUID.randomUUID(), "Nina", "sudoku", 2410, java.time.Instant.now().minusSeconds(3600))
		));
	}

	@Override
	public synchronized RankingEntry save(RankingEntry entry) {
		entries.add(entry);
		return entry;
	}

	@Override
	public synchronized List<RankingEntry> findTop(int limit) {
		return entries.stream()
				.sorted(Comparator.comparingInt(RankingEntry::score).reversed())
				.limit(limit)
				.toList();
	}

	@Override
	public synchronized List<RankingEntry> findTopByGame(String gameSlug, int limit) {
		return entries.stream()
				.filter(entry -> entry.gameSlug().equals(gameSlug))
				.sorted(Comparator.comparingInt(RankingEntry::score).reversed())
				.limit(limit)
				.toList();
	}
}
