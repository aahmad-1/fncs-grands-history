import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { RawPlacementPlayerRow, PlacementRow } from '../types/player'

// sets any dates shown to whatever date format the user's device is set to
const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString()
}

const PlayerProfile = () => {
    const { playerId } = useParams<{ playerId: string }>()
    const [playerName, setPlayerName] = useState<string>('')
    const [placements, setPlacements] = useState<PlacementRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)

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

            setPlacements(rows)
            setLoading(false)
        }

        fetchPlayerData()
    }, [playerId])

    if (loading) return <p>Loading...</p>

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{playerName}</h1>

            <div className="overflow-x-auto">
                <table className="border-collapse border border-gray-700 text-sm">
                    <tbody>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Event</th>
                            {placements.map((p) => (
                                <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 whitespace-nowrap">
                                    {p.tournament_name.replace(/_/g, ' ')}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Date</th>
                            {placements.map((p) => (
                                <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 whitespace-nowrap">
                                    {p.start_date === p.end_date
                                        ? formatDate(p.start_date)
                                        : `${formatDate(p.start_date)} - ${formatDate(p.end_date)}`}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Gamemode</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2">{p.gamemode}</td>)}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Teammates</th>
                            {placements.map((p) => (
                                <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 whitespace-nowrap">
                                    {p.teammates.length > 0
                                        ? p.teammates.map((teammate, i) => (
                                            <span key={teammate.liquipedia_id}>
                                                <Link to={`/players/${encodeURIComponent(teammate.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                                    {teammate.display_name}
                                                </Link>
                                                {i < p.teammates.length - 1 ? ', ' : ''}
                                            </span>
                                        ))
                                        : '-'}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Placement</th>
                            {placements.map((p) => {
                                // some FNCS lans (2023 globals, C7M1 summit) had more teams qualify/invited than the amount that could actually fit in the lobby game
                                // those extra teams that never made the finals from lower bracket still earned money
                                const isDNP = p.placement > p.max_teams
                                return (
                                    <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 font-semibold">
                                        {isDNP ? 'DNP' : p.placement}
                                    </td>
                                )
                            })}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Earnings</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2">${Math.round(p.earningsPerPlayer).toLocaleString()}</td>)}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Region</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2">{p.region}</td>)}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Total Teams</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2">{p.total_teams}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PlayerProfile