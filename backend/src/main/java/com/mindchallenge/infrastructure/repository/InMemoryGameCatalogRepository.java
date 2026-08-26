package com.mindchallenge.infrastructure.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.mindchallenge.domain.model.ChallengeGroup;
import com.mindchallenge.domain.model.DailyChallenge;
import com.mindchallenge.domain.model.Difficulty;
import com.mindchallenge.domain.model.ExtraMode;
import com.mindchallenge.domain.model.Game;
import com.mindchallenge.domain.repository.GameCatalogRepository;

@Repository
public class InMemoryGameCatalogRepository implements GameCatalogRepository {
	private final List<ChallengeGroup> groups = List.of(
			new ChallengeGroup(
					"kids",
					"Modo Kids",
					"Jogos coloridos para treinar memoria, letras e reconhecimento visual.",
					"toy",
					"children",
					List.of(
							new Game("memory-kids", "Jogo da memoria", "Encontre pares iguais antes do tempo acabar.", "cards", "Atencao focada", Difficulty.EASY, 4),
							new Game("shape-match", "Encaixar formas", "Arraste cada forma para o lugar correto.", "shapes", "Reconhecimento visual", Difficulty.EASY, 3),
							new Game("color-sequence", "Sequencia de cores", "Repita a ordem das cores sem errar.", "palette", "Raciocinio logico", Difficulty.MEDIUM, 5),
							new Game("letters", "Letras e palavras", "Monte palavras simples a partir das letras.", "letters", "Alfabetizacao", Difficulty.EASY, 4)
					)
			),
			new ChallengeGroup(
					"adults",
					"Modo Adultos",
					"Desafios para treinar logica, calculo, memoria e visao espacial.",
					"brain",
					"adults",
					List.of(
							new Game("sudoku", "Sudoku", "Complete o tabuleiro usando raciocinio logico.", "numbers", "Raciocinio logico", Difficulty.HARD, 12),
							new Game("puzzle", "Puzzle", "Reconstrua a imagem no menor tempo possivel.", "puzzle", "Visao espacial", Difficulty.MEDIUM, 8),
							new Game("logic-sequence", "Sequencia logica", "Descubra o proximo item do padrao.", "chart", "Padroes abstratos", Difficulty.MEDIUM, 6),
							new Game("flipped-cards", "Cartas viradas", "Memorize cartas e encontre pares rapidamente.", "cards", "Memoria fotografica", Difficulty.MEDIUM, 6),
							new Game("math-rush", "Desafio matematico", "Resolva contas rapidas contra o relogio.", "division", "Calculo rapido", Difficulty.HARD, 5)
					)
			)
	);

	private final List<ExtraMode> extraModes = List.of(
			new ExtraMode("arcade", "Arcade", "High Score", "joystick", "Partidas curtas focadas em pontuacao maxima.", List.of("Ranking geral", "Combos", "Velocidade")),
			new ExtraMode("reflex", "Reflexos", "Agilidade Pura", "bolt", "Testes de clique, tempo de reacao e precisao.", List.of("Endless", "Precisao", "Contra o tempo")),
			new ExtraMode("daily", "Diario", "Todo Dia", "fire", "Um desafio novo por dia.", List.of("Recompensa diaria", "Meta unica")),
			new ExtraMode("tournament", "Torneios", "Multiplayer", "trophy", "Disputas por temporada e ranking.", List.of("Temporadas", "Ranking", "Premiacoes"))
	);

	@Override
	public List<ChallengeGroup> findChallengeGroups() {
		return groups;
	}

	@Override
	public List<ExtraMode> findExtraModes() {
		return extraModes;
	}

	@Override
	public Optional<Game> findGameBySlug(String slug) {
		return groups.stream()
				.flatMap(group -> group.games().stream())
				.filter(game -> game.slug().equals(slug))
				.findFirst();
	}

	@Override
	public DailyChallenge findDailyChallenge(LocalDate date) {
		List<Game> games = groups.stream()
				.flatMap(group -> group.games().stream())
				.toList();
		Game game = games.get(Math.floorMod(date.getDayOfYear(), games.size()));
		return new DailyChallenge(
				date,
				game.slug(),
				"Desafio diario: " + game.name(),
				game.description(),
				1200 + (date.getDayOfMonth() * 75),
				50 + Math.floorMod(date.getDayOfYear(), 5) * 10
		);
	}
}
