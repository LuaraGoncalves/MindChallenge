package com.mindchallenge.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;
import com.mindchallenge.domain.model.CharacterTheme;
import com.mindchallenge.domain.model.MemoryCharacter;
import com.mindchallenge.domain.repository.CharacterCatalogRepository;

@Repository
public class DatabaseCharacterCatalogRepository implements CharacterCatalogRepository {
	private final JpaCharacterThemeRepository themes;
	private final JpaMemoryCharacterRepository characters;
	public DatabaseCharacterCatalogRepository(JpaCharacterThemeRepository themes, JpaMemoryCharacterRepository characters) {
		this.themes = themes; this.characters = characters;
	}
	public List<CharacterTheme> themes() { return themes.findAll(Sort.by("name")).stream().map(CharacterThemeEntity::toDomain).toList(); }
	public Optional<CharacterTheme> theme(String id) { return themes.findById(id).map(CharacterThemeEntity::toDomain); }
	public CharacterTheme saveTheme(CharacterTheme theme) { return themes.save(new CharacterThemeEntity(theme)).toDomain(); }
	public void deleteTheme(String id) { themes.deleteById(id); }
	public List<MemoryCharacter> characters() { return characters.findAll(Sort.by("name")).stream().map(MemoryCharacterEntity::toDomain).toList(); }
	public Optional<MemoryCharacter> character(String id) { return characters.findById(id).map(MemoryCharacterEntity::toDomain); }
	public MemoryCharacter saveCharacter(MemoryCharacter character) { return characters.save(new MemoryCharacterEntity(character)).toDomain(); }
	public void deleteCharacter(String id) { characters.deleteById(id); }
}
