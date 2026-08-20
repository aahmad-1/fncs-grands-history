CREATE TABLE players (
    liquipedia_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    image_url TEXT
);

CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
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
    logo_key TEXT,
    UNIQUE (name, region)
);

CREATE TABLE placements (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    team_id UUID DEFAULT gen_random_uuid(),
    placement INTEGER NOT NULL,
    earnings NUMERIC DEFAULT 0,
    disqualified BOOLEAN DEFAULT false
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

CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON placements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON placement_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON player_aliases FOR SELECT USING (true);

CREATE OR REPLACE VIEW player_rankings AS
WITH placement_team_size AS (
    SELECT placement_id, COUNT(*) AS team_size
    FROM placement_players
    GROUP BY placement_id
),
valid_placements AS (
    SELECT pl.id, pl.placement, pl.earnings, pl.tournament_id
    FROM placements pl
    JOIN tournaments t ON t.id = pl.tournament_id
    WHERE pl.placement <= t.max_teams
    AND pl.disqualified = false
)
SELECT
    p.liquipedia_id,
    p.display_name,
    COUNT(*) FILTER (WHERE vp.placement = 1) AS wins,
    COUNT(*) FILTER (WHERE vp.placement <= 3) AS top3,
    COUNT(*) FILTER (WHERE vp.placement <= 5) AS top5,
    COUNT(*) FILTER (WHERE vp.placement <= 10) AS top10,
    COUNT(*) AS events_qualified,
    ROUND(AVG(vp.placement), 1) AS avg_placement,
    ROUND(SUM(vp.earnings / ts.team_size)) AS total_earnings
FROM players p
JOIN placement_players pp ON pp.player_id = p.liquipedia_id
JOIN valid_placements vp ON vp.id = pp.placement_id
JOIN placement_team_size ts ON ts.placement_id = vp.id
GROUP BY p.liquipedia_id, p.display_name;

ALTER VIEW player_rankings SET (security_invoker = true);