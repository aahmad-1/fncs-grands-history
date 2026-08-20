-- sets a logo for a specific tournament (run only once per new event added after adding logo to bucket)
UPDATE tournaments SET logo_key = '<tournament_name>' WHERE name = '<tournament_name>';

-- tournament lookup
SELECT
    t.id AS tournament_id,
    t.name,
    t.region,
    p.id AS placement_id,
    p.placement,
    p.earnings,
    string_agg(pl.display_name, ', ') AS players
FROM tournaments t
JOIN placements p ON p.tournament_id = t.id
JOIN placement_players pp ON pp.placement_id = p.id
JOIN players pl ON pl.liquipedia_id = pp.player_id
WHERE t.name = 'C4M3'
AND t.region = 'OCE'
GROUP BY t.id, t.name, t.region, p.id, p.placement, p.earnings
ORDER BY p.placement;

-- marks a team disqualified and shift placements below them up by one
UPDATE placements SET disqualified = true WHERE id = <placement_id>;
UPDATE placements SET placement = placement - 1
WHERE tournament_id = <tournament_id> AND placement > <original_dq_placement>;