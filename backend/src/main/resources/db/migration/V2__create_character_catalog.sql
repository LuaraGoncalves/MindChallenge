CREATE TABLE character_themes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL
);

CREATE TABLE memory_characters (
    id VARCHAR(36) PRIMARY KEY,
    theme_id VARCHAR(36) NOT NULL REFERENCES character_themes(id),
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    active BOOLEAN NOT NULL
);

CREATE INDEX idx_memory_characters_theme_active ON memory_characters (theme_id, active);
