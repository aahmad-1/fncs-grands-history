import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatDate } from '../utils/formatDate'
import type { RawPlacementPlayerRow, PlacementRow, TournamentSummary } from '../types/player'
import Skeleton from '../components/Skeleton'
import { MdSportsEsports, FaTrophy, LuColumns3, LuRows3, FaRegCalendarAlt, MdSwapVert } from '../constants/icons'


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
                        disqualified,
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
                    disqualified: row.placements.disqualified,
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
                    disqualified: false
                }))

            const allRows = [...rows, ...dnqRows]
            allRows.sort((a, b) => a.start_date.localeCompare(b.start_date))

            setPlacements(allRows)
            setLoading(false)
        }

        fetchPlayerData()
    }, [playerId])

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
        { key: 'placement', label: 'Placement', alwaysShow: false, show: visibleRows.placement, render: (p: PlacementRow) => {
            // DNQ covers two cases: never played the qualifiers/heats at all, or played them but didnt qualify
            // tracking which one happened would mean scraping the qualifiers and heats leaderboards too, but the tournament format isn't always the same, and it's a bunch of links and a hassle to impliment
            // some FNCS lans (2023 globals, C7M1 summit) had more teams qualify/invited than the amount that could actually fit in the lobby game
            // those extra teams that never made the finals from lower bracket still earned money, thats what DNP is for
            if (p.placement === -1) return 'DNQ'
            if (p.disqualified) return 'DQ'
            return p.placement > p.max_teams ? 'DNP' : p.placement}},
        { key: 'earnings', label: 'Earnings', alwaysShow: false, show: visibleRows.earnings, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : `$${Math.round(p.earningsPerPlayer).toLocaleString()}` },
        { key: 'region', label: 'Region', alwaysShow: false, show: visibleRows.region, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : p.region },
        { key: 'totalTeams', label: 'Total Teams', alwaysShow: false, show: visibleRows.totalTeams, render: (p: PlacementRow) =>
            p.placement === -1 ? '-' : p.total_teams }
    ]

    const rowDefinitions = getRowDefinitions().filter((r) => r.alwaysShow || r.show)

    return (
        <div className="flex flex-col min-[678px]:flex-row h-auto min-[678px]:h-screen overflow-x-hidden">
            <div className="flex flex-col items-center w-full min-[678px]:w-64 shrink-0 border-r-0 min-[678px]:border-r border-b min-[678px]:border-b-0 border-gray-700 p-4">
                <Link to="/players" className="block text-blue-400 hover:underline text-sm mb-4">← Back to search</Link>

                {loading ? (
                    <Skeleton className="h-8 w-40 mb-4" />
                ) : (
                    <h1
                        className="font-bold text-center w-full whitespace-nowrap"
                        style={{ fontSize: `clamp(1rem, ${26 / playerName.length}rem, 1.875rem)` }}
                    >
                        {playerName}
                    </h1>
                )}

                {loading ? (
                    <Skeleton className="w-32 h-32 rounded mb-4" />
                ) : (
                    <div className="w-32 h-32 bg-gray-800 rounded mb-4 flex items-center justify-center text-xs text-gray-500">No image</div>
                )}

                <div className="w-full max-w-72 mx-auto bg-gray-800 rounded-lg p-4 flex flex-col gap-2 text-sm">
                    {loading ? (
                        Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)
                    ) : (
                        <>
                            <p><span className="text-gray-400">Grands Qualified For:</span> <span className="text-white font-medium">{eventsQualified}</span></p>
                            <p><span className="text-gray-400">Average Placement:</span> <span className="text-white font-medium">{calculateAverage()}</span></p>
                            <p><span className="text-gray-400">Average Solos:</span> <span className="text-white font-medium">{calculateAverage('Solos')}</span></p>
                            <p><span className="text-gray-400">Average Duos:</span> <span className="text-white font-medium">{calculateAverage('Duos')}</span></p>
                            <p><span className="text-gray-400">Average Trios:</span> <span className="text-white font-medium">{calculateAverage('Trios')}</span></p>
                            <p><span className="text-gray-400">Average Squads:</span> <span className="text-white font-medium">{calculateAverage('Squads')}</span></p>
                            <p className="pt-2 border-t border-gray-700 mt-2"><span className="text-gray-400">Total Earnings:</span> <span className="text-white font-medium">${Math.round(totalEarnings).toLocaleString()}</span></p>
                        </>
                    )}
                </div>

            </div>

            <div className="flex-1 w-full overflow-y-visible min-[678px]:overflow-y-auto p-6">

                <button
                    onClick={() => setShowFilters(true)}
                    className="bg-gray-800 border border-gray-700 px-4 py-2 rounded mb-4 transition-colors hover:bg-gray-700"
                >
                    Filters
                </button>

                <div
                    className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setShowFilters(false)}
                >
                    <div
                        className={`fixed right-0 top-0 h-screen w-80 bg-gray-900 border-l border-gray-700 p-6 z-[70] overflow-y-auto transition-transform duration-300 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                <MdSportsEsports /> GAMEMODE
                            </p>
                            {['Solos', 'Duos', 'Trios', 'Squads'].map((mode) => (
                                <label key={mode} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={gamemodeFilter.has(mode)}
                                        onChange={() => {
                                            const updated = new Set(gamemodeFilter)
                                            updated.has(mode) ? updated.delete(mode) : updated.add(mode)
                                            setGamemodeFilter(updated)
                                        }}
                                    />
                                    <span className="text-sm">{mode}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                <FaTrophy /> PLACEMENTS
                            </p>
                            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-800 cursor-pointer mb-1">
                                <input type="checkbox" checked={qualifiedOnly} onChange={(e) => setQualifiedOnly(e.target.checked)} />
                                <span className="text-sm">Qualified for only</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <span className="text-sm">Min placement:</span>
                                <input
                                    type="number"
                                    value={minPlacement}
                                    onChange={(e) => setMinPlacement(e.target.value)}
                                    className="w-16 bg-gray-800 border border-gray-700 px-1"
                                />
                            </label>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                {isHorizontal ? <LuColumns3 /> : <LuRows3 />} {isHorizontal ? 'ROWS' : 'COLUMNS'}
                            </p>
                            {Object.entries(visibleRows).map(([key, value]) => (
                                <label key={key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => setVisibleRows({ ...visibleRows, [key]: !value })}
                                    />
                                    <span className="text-sm">{rowLabels[key]}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                <FaRegCalendarAlt /> DATE
                            </p>
                            <label className="flex items-center gap-2 px-2 py-1 mb-2">
                                <span className="text-sm">From:</span>
                                <input
                                    key={`from-${resetDateCounter}`}
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-1"
                                />
                            </label>
                            <label className="flex items-center gap-2 px-2 py-1 mb-2">
                                <span className="text-sm">To:</span>
                                <input
                                    key={`to-${resetDateCounter}`}
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-1"
                                />
                            </label>
                            <button onClick={() => { setDateFrom(''); setDateTo(''); setResetDateCounter(resetDateCounter + 1) }} className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs ml-2">Reset dates</button>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 px-2 py-1.5">
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                                    <MdSwapVert /> ORIENTATION
                                </span>
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
                        <div className="max-w-full rounded-xl border border-gray-800 overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
                            <div className="max-h-[80vh] overflow-auto">
                                <table className="border-separate border-spacing-0 text-sm">
                                    <tbody>
                                        {rowDefinitions.map((row) => (
                                            <tr key={row.key}>
                                                <th className="border-l border-r border-gray-800 bg-[#1a2332] text-white font-semibold px-3 py-2 text-center sticky left-0 z-10">
                                                    {row.label}
                                                </th>
                                                {loading
                                                    ? Array.from({ length: 8 }).map((_, i) => (
                                                        <td key={i} className="border-r border-gray-800 bg-[#141e29] px-3 py-2 text-center">
                                                            <Skeleton className="h-4 w-16 mx-auto" />
                                                        </td>
                                                    ))
                                                    : filteredPlacements.map((p) => (
                                                        <td key={p.tournament_name} className="border-r border-gray-800 bg-[#141e29] transition-colors px-3 py-2 whitespace-nowrap text-center">
                                                            {row.render(p)}
                                                        </td>
                                                    ))
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="w-fit max-w-full mx-auto rounded-xl border border-gray-800 overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
                            <div className="max-h-[75vh] overflow-auto">
                                <table className="border-separate border-spacing-0 text-sm mx-auto">
                                    <thead>
                                        <tr>
                                            {rowDefinitions.map((row) => (
                                                <th key={row.key} className="sticky top-0 z-10 bg-[#1a2332] px-4 py-3 text-white font-semibold text-center">{row.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading
                                            ? Array.from({ length: 10 }).map((_, i) => (
                                                <tr key={i} className="bg-[#141e29]">
                                                    {rowDefinitions.map((row) => (
                                                        <td key={row.key} className="border-t border-gray-800 px-4 py-3 text-center">
                                                            <Skeleton className="h-4 w-16 mx-auto" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                            : filteredPlacements.map((p) => (
                                                <tr key={p.tournament_name} className="bg-[#141e29] hover:bg-gray-800 transition-colors">
                                                    {rowDefinitions.map((row) => (
                                                        <td key={row.key} className="border-t border-gray-800 px-4 py-3 whitespace-nowrap text-center">{row.render(p)}</td>
                                                    ))}
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile