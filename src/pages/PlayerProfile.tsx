import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { RawPlacementPlayerRow, PlacementRow, TournamentSummary } from '../types/player'

// sets any dates shown to whatever date format the user's device is set to
const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString()
}

const rowLabels: Record<string, string> = {
    placement: 'Placement',
    earnings: 'Earnings',
    region: 'Region',
    teammates: 'Teammates',
    totalTeams: 'Total Teams'
}

const PlayerProfile = () => {
    const { playerId } = useParams<{ playerId: string }>()
    const [playerName, setPlayerName] = useState<string>('')
    const [placements, setPlacements] = useState<PlacementRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isHorizontal, setIsHorizontal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // states for filters
    const [visibleRows, setVisibleRows] = useState({
        placement: true,
        earnings: true,
        region: true,
        teammates: true,
        totalTeams: true
    })

    const [gamemodeFilter, setGamemodeFilter] = useState<Set<string>>(
        new Set(['Solos', 'Duos', 'Trios', 'Squads'])
    )
    const [qualifiedOnly, setQualifiedOnly] = useState(false)
    const [minPlacement, setMinPlacement] = useState<string>('')
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')
    const [resetDateCounter, setResetDateCounter] = useState(0)
    

    useEffect(() => {
        const fetchPlayerData = async () => {
            const fullId = `/fortnite/${playerId}`

            const { data: player } = await supabase
                .from('players')
                .select('display_name')
                .eq('liquipedia_id', fullId)
                .single()

            if (player) setPlayerName(player.display_name)

            // pulling everyone else in the same placement too (not just this player's own row) so we can list teammates further down
            const { data: placementData, error } = await supabase
                .from('placement_players')
                .select(`
                    placements (
                        placement,
                        earnings,
                        placement_players ( players ( liquipedia_id, display_name ) ),
                        tournaments ( name, gamemode, region, start_date, end_date, total_teams, max_teams )
                    )
                `)
                .eq('player_id', fullId)

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            // supabase cant fully figure out the shape of nested joins this deep, so it types them generically
            // casting through unknown first since we already know the real shape from testing this in browser
            const rows: PlacementRow[] = (placementData as unknown as RawPlacementPlayerRow[] ?? []).map((row) => {
                const allTeamMembers = row.placements.placement_players.map((pp) => pp.players)

                // liquipedia tracks team earnings are stored as a whole, so must divide by team number
                const earningsPerPlayer = row.placements.earnings / allTeamMembers.length

                // shows everyone on the team except the player whose page the user is on
                const teammates = allTeamMembers
                    .filter((member) => member.liquipedia_id !== fullId)

                return {
                    tournament_name: row.placements.tournaments.name,
                    gamemode: row.placements.tournaments.gamemode,
                    region: row.placements.tournaments.region,
                    start_date: row.placements.tournaments.start_date,
                    end_date: row.placements.tournaments.end_date,
                    total_teams: row.placements.tournaments.total_teams,
                    max_teams: row.placements.tournaments.max_teams,
                    placement: row.placements.placement,
                    earnings: row.placements.earnings,
                    teammates,
                    earningsPerPlayer
                }
            })

            // sort oldest to newest so the table reads left to right chronologically
            rows.sort((a, b) => a.start_date.localeCompare(b.start_date))

            // grabbing every tourney ever to figure out which ones a player missed
            const { data: allTournaments } = await supabase
                .from('tournaments')
                .select('name, gamemode, start_date, end_date, region')

            // same event name shows up once per region, so only need one entry per event to check if a player qualed or not
            const uniqueEvents = Array.from(
                new Map((allTournaments ?? []).map((t) => [t.name, t as TournamentSummary])).values()
            )

            const playedEventNames = new Set(rows.map((r) => r.tournament_name))

            // for events this player DNQ'd, need a real region to link to since none was actually played
            const eventRegions = new Map<string, string[]>()
            for (const t of allTournaments ?? []) {
                if (!eventRegions.has(t.name)) eventRegions.set(t.name, [])
                eventRegions.get(t.name)!.push(t.region)
            }

            const getDefaultRegion = (eventName: string): string => {
                const regions = eventRegions.get(eventName) ?? []
                return regions.includes('Global') ? 'Global' : regions.includes('NAE') ? 'NAE' : 'NAC'
            }

            // building a fake placement entry for every event a player never showed up in, so the table can display DNQ for them
            const dnqRows: PlacementRow[] = uniqueEvents
                .filter((event) => !playedEventNames.has(event.name))
                .map((event) => ({
                    tournament_name: event.name,
                    gamemode: event.gamemode,
                    region: getDefaultRegion(event.name),
                    start_date: event.start_date,
                    end_date: event.end_date,
                    total_teams: 0,
                    max_teams: 0,
                    placement: -1,
                    earnings: 0,
                    teammates: [],
                    earningsPerPlayer: 0,
                }))

            const allRows = [...rows, ...dnqRows]
            allRows.sort((a, b) => a.start_date.localeCompare(b.start_date))

            setPlacements(allRows)
            setLoading(false)
        }

        fetchPlayerData()
    }, [playerId])

    if (loading) return <p className="text-center">Loading...</p>

    // applying all the checkbox/input filters on top of the full placements list before rendering
    const filteredPlacements = placements.filter((p) => {
        if (!gamemodeFilter.has(p.gamemode)) return false
        if (qualifiedOnly && p.placement === -1) return false
        if (minPlacement && p.placement !== -1 && p.placement > Number(minPlacement)) return false
        if (dateFrom && p.start_date < dateFrom) return false
        if (dateTo && p.start_date > dateTo) return false
        return true
    })

    // only counting placements that actually happened (not DNQ/DNP), and only from whats currently visible after filters
    const scoredPlacements = filteredPlacements.filter((p) => p.placement !== -1 && p.placement <= p.max_teams)

    const calculateAverage = (gamemode?: string) => {
        const relevant = gamemode
            ? scoredPlacements.filter((p) => p.gamemode === gamemode)
            : scoredPlacements

        if (relevant.length === 0) return '-'

        const total = relevant.reduce((sum, p) => sum + p.placement, 0)
        return (total / relevant.length).toFixed(1)
    }

    const totalEarnings = filteredPlacements.reduce((sum, p) => sum + (p.placement === -1 ? 0 : p.earningsPerPlayer), 0)
    const eventsQualified = filteredPlacements.filter((p) => p.placement !== -1).length

    // one definition per stat row thats reused for both the horizontal & vertical table layouts
    // makes it so we only write each cell's logic once
    const getRowDefinitions = () => [
        { key: 'event', label: 'Event', alwaysShow: true, render: (p: PlacementRow) => (
            <Link to={`/tournaments/${p.tournament_name}?region=${encodeURIComponent(p.region)}`} className="text-blue-400 hover:underline">
                {p.tournament_name.replace(/_/g, ' ')}
            </Link>
        ) },
        { key: 'date', label: 'Date', alwaysShow: true, render: (p: PlacementRow) =>
            p.start_date === p.end_date ? formatDate(p.start_date) : `${formatDate(p.start_date)} - ${formatDate(p.end_date)}` },
        { key: 'gamemode', label: 'Gamemode', alwaysShow: true, render: (p: PlacementRow) => p.gamemode },
        { key: 'teammates', label: 'Teammates', alwaysShow: false, show: visibleRows.teammates, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : p.teammates.length > 0
                ? p.teammates.map((teammate, i) => (
                    <span key={teammate.liquipedia_id}>
                        <Link to={`/players/${encodeURIComponent(teammate.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                            {teammate.display_name}
                        </Link>
                        {i < p.teammates.length - 1 ? ', ' : ''}
                    </span>
                ))
                : '-' },
        { key: 'placement', label: 'Placement', alwaysShow: false, show: visibleRows.placement, render: (p: PlacementRow) =>
            // DNQ covers two cases: never played the qualifiers/heats at all, or played them but didnt qualify
            // tracking which one happened would mean scraping the qualifiers and heats leaderboards too, but the tournament format isn't always the same, and it's a bunch of links and a hassle to impliment
            // some FNCS lans (2023 globals, C7M1 summit) had more teams qualify/invited than the amount that could actually fit in the lobby game
            // those extra teams that never made the finals from lower bracket still earned money, thats what DNP is for
            p.placement === -1 ? 'DNQ' : p.placement > p.max_teams ? 'DNP' : p.placement },
        { key: 'earnings', label: 'Earnings', alwaysShow: false, show: visibleRows.earnings, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : `$${Math.round(p.earningsPerPlayer).toLocaleString()}` },
        { key: 'region', label: 'Region', alwaysShow: false, show: visibleRows.region, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : p.region },
        { key: 'totalTeams', label: 'Total Teams', alwaysShow: false, show: visibleRows.totalTeams, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : p.total_teams }
    ]

    const rowDefinitions = getRowDefinitions().filter((r) => r.alwaysShow || r.show)

    return (
        <div className="flex h-screen">
            <div className="flex flex-col items-center w-64 shrink-0 border-r border-gray-700 p-4 sticky top-0 h-screen overflow-hidden">
                <Link to="/players" className="block text-blue-400 hover:underline text-sm mb-4">← Back to search</Link>
                <h1 className="text-2xl font-bold">{playerName}</h1>
                <div className="w-32 h-32 bg-gray-800 rounded mb-4 flex items-center justify-center text-xs text-gray-500">No image</div>
                <p>Grands Qualified For: {eventsQualified}</p>
                <p>Average Placement: {calculateAverage()}</p>
                <p>Average Solos: {calculateAverage('Solos')}</p>
                <p>Average Duos: {calculateAverage('Duos')}</p>
                <p>Average Trios: {calculateAverage('Trios')}</p>
                <p>Average Squads: {calculateAverage('Squads')}</p>
                <p>Total Earnings: ${Math.round(totalEarnings).toLocaleString()}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

                <button
                    onClick={() => setShowFilters(true)}
                    className="bg-gray-800 border border-gray-700 px-4 py-2 rounded mb-4 transition-colors hover:bg-gray-700"
                >
                    Filters
                </button>

                <div
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setShowFilters(false)}
                >
                    <div
                        className={`fixed right-0 top-0 h-screen w-80 bg-gray-900 border-l border-gray-700 p-6 z-50 overflow-y-auto transition-transform duration-300 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2">GAMEMODE</p>
                            {['Solos', 'Duos', 'Trios', 'Squads'].map((mode) => (
                                <label key={mode} className="block mb-1">
                                    <input
                                        type="checkbox"
                                        checked={gamemodeFilter.has(mode)}
                                        onChange={() => {
                                            const updated = new Set(gamemodeFilter)
                                            updated.has(mode) ? updated.delete(mode) : updated.add(mode)
                                            setGamemodeFilter(updated)
                                        }}
                                    />{' '}{mode}
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2">PLACEMENTS</p>
                            <label className="block mb-2">
                                <input type="checkbox" checked={qualifiedOnly} onChange={(e) => setQualifiedOnly(e.target.checked)} />{' '}
                                Qualified for only
                            </label>
                            <label className="block">
                                Min placement:{' '}
                                <input
                                    type="number"
                                    value={minPlacement}
                                    onChange={(e) => setMinPlacement(e.target.value)}
                                    className="w-16 bg-gray-800 border border-gray-700 px-1 ml-1"
                                />
                            </label>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2">{isHorizontal ? 'ROWS' : 'COLUMNS'}</p>
                            {Object.entries(visibleRows).map(([key, value]) => (
                                <label key={key} className="block mb-1">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => setVisibleRows({ ...visibleRows, [key]: !value })}
                                    />{' '}{rowLabels[key]}
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2">DATE</p>
                            <label className="block mb-2">From: <input
                                key={`from-${resetDateCounter}`}
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-gray-800 border border-gray-700 px-1 ml-1"
                            /></label>
                            <label className="block mb-2">To: <input
                                key={`to-${resetDateCounter}`}
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-gray-800 border border-gray-700 px-1 ml-1"
                            /></label>
                            <button onClick={() => { setDateFrom(''); setDateTo(''); setResetDateCounter(resetDateCounter + 1) }} className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs">Reset dates</button>
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400">ORIENTATION</span>
                                <button
                                    onClick={() => setIsHorizontal(!isHorizontal)}
                                    className="bg-gray-800 border border-gray-700 px-3 py-1 rounded text-sm"
                                >
                                    {isHorizontal ? 'Horizontal' : 'Vertical'}
                                </button>
                            </label>
                        </div>
                    </div>
                </div>


                <div className="overflow-x-auto">
                    {isHorizontal ? (
                        <table className="border-collapse border border-gray-700 text-sm">
                            <tbody>
                                {rowDefinitions.map((row) => (
                                    <tr key={row.key}>
                                        <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-center sticky left-0">{row.label}</th>
                                        {filteredPlacements.map((p) => (
                                            <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 whitespace-nowrap text-center">{row.render(p)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="mx-auto border-collapse border border-gray-700 text-sm">
                            <thead>
                                <tr>
                                    {rowDefinitions.map((row) => (
                                        <th key={row.key} className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-center">{row.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlacements.map((p) => (
                                    <tr key={p.tournament_name}>
                                        {rowDefinitions.map((row) => (
                                            <td key={row.key} className="border border-gray-700 px-3 py-2 whitespace-nowrap text-center">{row.render(p)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile