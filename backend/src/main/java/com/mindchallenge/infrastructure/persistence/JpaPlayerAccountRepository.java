package com.mindchallenge.infrastructure.persistence;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaPlayerAccountRepository extends JpaRepository<PlayerAccountEntity, String> {
	Optional<PlayerAccountEntity> findByUsername(String username);
	boolean existsByUsername(String username);
}
