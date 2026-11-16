package com.mindchallenge.infrastructure.persistence;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaRankingEntryRepository extends JpaRepository<RankingEntryEntity, String> {
	List<RankingEntryEntity> findAllByOrderByScoreDescCreatedAtAsc(Pageable pageable);

	List<RankingEntryEntity> findByGameSlugOrderByScoreDescCreatedAtAsc(String gameSlug, Pageable pageable);
}
