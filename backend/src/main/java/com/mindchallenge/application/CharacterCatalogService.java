package com.mindchallenge.application;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.mindchallenge.domain.model.CharacterTheme;
import com.mindchallenge.domain.model.MemoryCharacter;
import com.mindchallenge.domain.repository.CharacterCatalogRepository;
import com.mindchallenge.shared.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class CharacterCatalogService {
	public record PublishedTheme(String id, String name, long characterCount) {}
	public record PublishedCharacter(String id, String name, String image) {}
	private final CharacterCatalogRepository repository;
	public CharacterCatalogService(CharacterCatalogRepository repository) { this.repository = repository; }
	public List<CharacterTheme> themes() { return repository.themes(); }
	public List<MemoryCharacter> characters() { return repository.characters(); }

	@Transactional
	public CharacterTheme saveTheme(String id, String name, boolean active) {
		if (id != null) requireTheme(id);
		return repository.saveTheme(new CharacterTheme(id == null ? UUID.randomUUID().toString() : id, name.strip(), active));
	}
	@Transactional
	public void deleteTheme(String id) {
		requireTheme(id);
		if (repository.characters().stream().anyMatch(character -> character.themeId().equals(id))) {
			throw new IllegalArgumentException("Remova ou transfira os personagens deste tema antes de excluir.");
		}
		repository.deleteTheme(id);
	}
	@Transactional
	public MemoryCharacter saveCharacter(String id, String themeId, String name, String imageUrl, boolean active) {
		if (id != null && repository.character(id).isEmpty()) throw new ResourceNotFoundException("Personagem nao encontrado");
		requireTheme(themeId);
		String image = imageUrl.strip();
		boolean uploaded = image.matches("/api/media/[a-f0-9-]{36}\\.png");
		try {
			URI uri = URI.create(image);
			if (!uploaded && (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getUserInfo() != null)) {
				throw new IllegalArgumentException();
			}
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Use uma imagem enviada ou uma URL HTTPS valida.");
		}
		return repository.saveCharacter(new MemoryCharacter(id == null ? UUID.randomUUID().toString() : id,
				themeId, name.strip(), image, active));
	}
	@Transactional
	public void deleteCharacter(String id) {
		if (repository.character(id).isEmpty()) throw new ResourceNotFoundException("Personagem nao encontrado");
		repository.deleteCharacter(id);
	}
	public List<PublishedTheme> publishedThemes() {
		List<MemoryCharacter> characters = repository.characters();
		return repository.themes().stream().filter(CharacterTheme::active)
				.map(theme -> new PublishedTheme(theme.id(), theme.name(), characters.stream()
						.filter(character -> character.active() && character.themeId().equals(theme.id())).count())).toList();
	}
	public List<PublishedCharacter> draw(String themeId, int count) {
		if (!List.of(6, 8, 12).contains(count)) throw new IllegalArgumentException("Escolha 6, 8 ou 12 pares.");
		if (!requireTheme(themeId).active()) throw new ResourceNotFoundException("Tema nao encontrado");
		List<MemoryCharacter> available = new ArrayList<>(repository.characters().stream()
				.filter(character -> character.active() && character.themeId().equals(themeId)).toList());
		if (available.size() < count) throw new IllegalArgumentException("Este tema nao tem personagens ativos suficientes.");
		Collections.shuffle(available);
		return available.stream().limit(count).map(character -> new PublishedCharacter(character.id(), character.name(), character.imageUrl())).toList();
	}
	private CharacterTheme requireTheme(String id) {
		return repository.theme(id).orElseThrow(() -> new ResourceNotFoundException("Tema nao encontrado"));
	}
}
