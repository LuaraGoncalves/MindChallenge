package com.mindchallenge.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaCharacterThemeRepository extends JpaRepository<CharacterThemeEntity, String> {}
