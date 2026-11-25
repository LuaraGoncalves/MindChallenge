package com.mindchallenge.infrastructure.persistence;

import com.mindchallenge.domain.model.MemoryCharacter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "memory_characters")
public class MemoryCharacterEntity {
	@Id @Column(length = 36) private String id;
	@Column(name = "theme_id", length = 36, nullable = false) private String themeId;
	@Column(length = 100, nullable = false) private String name;
	@Column(name = "image_url", length = 2048, nullable = false) private String imageUrl;
	@Column(nullable = false) private boolean active;
	protected MemoryCharacterEntity() {}
	public MemoryCharacterEntity(MemoryCharacter character) {
		id = character.id(); themeId = character.themeId(); name = character.name();
		imageUrl = character.imageUrl(); active = character.active();
	}
	public MemoryCharacter toDomain() { return new MemoryCharacter(id, themeId, name, imageUrl, active); }
}
