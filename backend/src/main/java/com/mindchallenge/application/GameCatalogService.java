package com.mindchallenge.application;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mindchallenge.domain.model.ChallengeGroup;
import com.mindchallenge.domain.model.DailyChallenge;
import com.mindchallenge.domain.model.ExtraMode;
import com.mindchallenge.domain.model.Game;
import com.mindchallenge.domain.repository.GameCatalogRepository;
import com.mindchallenge.shared.exception.ResourceNotFoundException;

@Service
public class GameCatalogService {
	private final GameCatalogRepository repository;
	private final Clock clock;

	public GameCatalogService(GameCatalogRepository repository) {
		this.repository = repository;
		this.clock = Clock.systemDefaultZone();
	}

	public List<ChallengeGroup> getChallengeGroups() {
		return repository.findChallengeGroups();
	}

	public List<ExtraMode> getExtraModes() {
		return repository.findExtraModes();
	}

	public Game getGame(String slug) {
		return repository.findGameBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Jogo nao encontrado: " + slug));
	}

	public DailyChallenge getDailyChallenge() {
		return repository.findDailyChallenge(LocalDate.now(clock));
	}
}
