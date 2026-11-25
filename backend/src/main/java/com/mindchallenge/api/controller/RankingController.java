package com.mindchallenge.api.controller;

import java.util.List;
import java.security.Principal;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mindchallenge.api.dto.SubmitScoreRequest;
import com.mindchallenge.application.RankingService;
import com.mindchallenge.domain.model.RankingEntry;

@RestController
@RequestMapping("/api/rankings")
public class RankingController {
	private final RankingService service;

	public RankingController(RankingService service) {
		this.service = service;
	}

	@GetMapping
	public List<RankingEntry> topRanking() {
		return service.getTopRanking();
	}

	@GetMapping("/{gameSlug}")
	public List<RankingEntry> topRankingByGame(@PathVariable String gameSlug) {
		return service.getTopRankingByGame(gameSlug);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RankingEntry submitScore(@Valid @RequestBody SubmitScoreRequest request, Principal player) {
		return service.submitScore(player.getName(), request.gameSlug(), request.score());
	}
}
