package com.mindchallenge.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mindchallenge.application.GameCatalogService;
import com.mindchallenge.domain.model.ChallengeGroup;
import com.mindchallenge.domain.model.DailyChallenge;
import com.mindchallenge.domain.model.ExtraMode;
import com.mindchallenge.domain.model.Game;

@RestController
@RequestMapping("/api/games")
public class GameCatalogController {
	private final GameCatalogService service;

	public GameCatalogController(GameCatalogService service) {
		this.service = service;
	}

	@GetMapping("/groups")
	public List<ChallengeGroup> groups() {
		return service.getChallengeGroups();
	}

	@GetMapping("/extras")
	public List<ExtraMode> extras() {
		return service.getExtraModes();
	}

	@GetMapping("/daily")
	public DailyChallenge daily() {
		return service.getDailyChallenge();
	}

	@GetMapping("/{slug}")
	public Game game(@PathVariable String slug) {
		return service.getGame(slug);
	}
}
