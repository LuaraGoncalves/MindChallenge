package com.mindchallenge.infrastructure.persistence;

import com.mindchallenge.domain.model.CharacterTheme;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "character_themes")
public class CharacterThemeEntity {
	@Id @Column(length = 36) private String id;
	@Column(length = 100, nullable = false) private String name;
	@Column(nullable = false) private boolean active;
	protected CharacterThemeEntity() {}
	public CharacterThemeEntity(CharacterTheme theme) { id = theme.id(); name = theme.name(); active = theme.active(); }
	public CharacterTheme toDomain() { return new CharacterTheme(id, name, active); }
}
