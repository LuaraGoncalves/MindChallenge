CREATE TABLE ranking_entries (
	id VARCHAR(36) PRIMARY KEY,
	player_name VARCHAR(40) NOT NULL,
	game_slug VARCHAR(60) NOT NULL,
	score INTEGER NOT NULL CHECK (score >= 0),
	created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_ranking_entries_score ON ranking_entries (score DESC, created_at ASC);
CREATE INDEX idx_ranking_entries_game_score ON ranking_entries (game_slug, score DESC, created_at ASC);
