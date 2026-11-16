package com.mindchallenge.infrastructure.persistence;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import com.mindchallenge.domain.model.RankingEntry;
import com.mindchallenge.domain.repository.RankingRepository;

@Repository
public class DatabaseRankingRepository implements RankingRepository {
	private final JpaRankingEntryRepository repository;

	public DatabaseRankingRepository(JpaRankingEntryRepository repository) {
		this.repository = repository;
	}

	@Override
	public RankingEntry save(RankingEntry entry) {
		return repository.save(RankingEntryEntity.fromDomain(entry)).toDomain();
	}

	@Override
	public List<RankingEntry> findTop(int limit) {
		return repository.findAllByOrderByScoreDescCreatedAtAsc(PageRequest.of(0, limit))
				.stream()
				.map(RankingEntryEntity::toDomain)
				.toList();
	}

	@Override
	public List<RankingEntry> findTopByGame(String gameSlug, int limit) {
		return repository.findByGameSlugOrderByScoreDescCreatedAtAsc(gameSlug, PageRequest.of(0, limit))
				.stream()
				.map(RankingEntryEntity::toDomain)
				.toList();
	}
}
