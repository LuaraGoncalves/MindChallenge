package com.mindchallenge.api.controller;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.mindchallenge.application.CharacterCatalogService;
import com.mindchallenge.domain.model.CharacterTheme;
import com.mindchallenge.domain.model.MemoryCharacter;

@RestController
public class CharacterCatalogController {
	public record ThemeRequest(@NotBlank @Size(max = 100) String name, boolean active) {}
	public record CharacterRequest(@NotBlank String themeId, @NotBlank @Size(max = 100) String name,
			@NotBlank @Size(max = 2048) String imageUrl, boolean active) {}
	private final CharacterCatalogService service;
	public CharacterCatalogController(CharacterCatalogService service) { this.service = service; }
	@GetMapping("/api/admin/themes") public List<CharacterTheme> themes() { return service.themes(); }
	@PostMapping("/api/admin/themes") @ResponseStatus(HttpStatus.CREATED)
	public CharacterTheme createTheme(@Valid @RequestBody ThemeRequest request) { return service.saveTheme(null, request.name(), request.active()); }
	@PutMapping("/api/admin/themes/{id}")
	public CharacterTheme updateTheme(@PathVariable String id, @Valid @RequestBody ThemeRequest request) { return service.saveTheme(id, request.name(), request.active()); }
	@DeleteMapping("/api/admin/themes/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteTheme(@PathVariable String id) { service.deleteTheme(id); }
	@GetMapping("/api/admin/characters") public List<MemoryCharacter> characters() { return service.characters(); }
	@PostMapping("/api/admin/characters") @ResponseStatus(HttpStatus.CREATED)
	public MemoryCharacter createCharacter(@Valid @RequestBody CharacterRequest request) { return service.saveCharacter(null, request.themeId(), request.name(), request.imageUrl(), request.active()); }
	@PutMapping("/api/admin/characters/{id}")
	public MemoryCharacter updateCharacter(@PathVariable String id, @Valid @RequestBody CharacterRequest request) { return service.saveCharacter(id, request.themeId(), request.name(), request.imageUrl(), request.active()); }
	@DeleteMapping("/api/admin/characters/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCharacter(@PathVariable String id) { service.deleteCharacter(id); }
	@GetMapping("/api/memory/themes") public List<CharacterCatalogService.PublishedTheme> publicThemes() { return service.publishedThemes(); }
	@GetMapping("/api/memory/themes/{id}/characters")
	public List<CharacterCatalogService.PublishedCharacter> draw(@PathVariable String id, @RequestParam(defaultValue = "8") int count) { return service.draw(id, count); }
}
