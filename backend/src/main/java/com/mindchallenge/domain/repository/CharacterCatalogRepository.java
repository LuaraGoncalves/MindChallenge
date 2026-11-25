package com.mindchallenge.domain.repository;

import java.util.List;
import java.util.Optional;
import com.mindchallenge.domain.model.CharacterTheme;
import com.mindchallenge.domain.model.MemoryCharacter;

public interface CharacterCatalogRepository {
	List<CharacterTheme> themes();
	Optional<CharacterTheme> theme(String id);
	CharacterTheme saveTheme(CharacterTheme theme);
	void deleteTheme(String id);
	List<MemoryCharacter> characters();
	Optional<MemoryCharacter> character(String id);
	MemoryCharacter saveCharacter(MemoryCharacter character);
	void deleteCharacter(String id);
}
