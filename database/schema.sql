CREATE TABLE players (
    liquipedia_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    image_url TEXT
);

CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,          -- e.g. "Season X, C2S1, C2S2, etc"
    gamemode TEXT NOT NULL,
    region TEXT NOT NULL,
    max_teams INTEGER,
    total_teams INTEGER,
    prize_pool NUMERIC,
    play_setting TEXT NOT NULL,
    location TEXT NOT NULL,
    venue TEXT,
    start_date DATE,
    end_date DATE,
    url TEXT,
    UNIQUE (name, region)
);

CREATE TABLE placements (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    team_id UUID DEFAULT gen_random_uuid(),  -- groups teammates for this placement
    placement INTEGER NOT NULL,
    earnings NUMERIC DEFAULT 0
);

CREATE TABLE placement_players (
    placement_id INTEGER REFERENCES placements(id),
    player_id TEXT REFERENCES players(liquipedia_id),
    PRIMARY KEY (placement_id, player_id)
);

CREATE TABLE player_aliases (
    player_id TEXT REFERENCES players(liquipedia_id),
    display_name TEXT NOT NULL,
    PRIMARY KEY (player_id, display_name)
);

ALTER TABLE player_aliases ENABLE ROW LEVEL SECURITY;

-- letting anyone read this data (its public fortnite stats) but blocking
-- any inserts/updates/deletes unless connecting with the db password directly
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON placements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON placement_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON player_aliases FOR SELECT USING (true);