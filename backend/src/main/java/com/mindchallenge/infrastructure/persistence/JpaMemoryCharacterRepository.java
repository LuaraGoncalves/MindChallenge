package com.mindchallenge.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaMemoryCharacterRepository extends JpaRepository<MemoryCharacterEntity, String> {}
