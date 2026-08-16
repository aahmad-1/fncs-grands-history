import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface PlacementRow {
    tournament_name: string
    gamemode: string
    region: string
    start_date: string
    end_date: string
    total_teams: number
    placement: number
    earnings: number
}

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

            const { data: placementData, error } = await supabase
                .from('placement_players')
                .select(`
                    placements (
                        placement,
                        earnings,
                        tournaments ( name, gamemode, region, start_date, end_date, total_teams )
                    )
                `)
                .eq('player_id', fullId)

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            const rows: PlacementRow[] = (placementData ?? []).map((row: any) => ({
                tournament_name: row.placements.tournaments.name,
                gamemode: row.placements.tournaments.gamemode,
                region: row.placements.tournaments.region,
                start_date: row.placements.tournaments.start_date,
                end_date: row.placements.tournaments.end_date,
                total_teams: row.placements.tournaments.total_teams,
                placement: row.placements.placement,
                earnings: row.placements.earnings
            }))

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
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Placement</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2 font-semibold">{p.placement}</td>)}
                        </tr>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 text-white px-3 py-2 text-left sticky left-0">Earnings</th>
                            {placements.map((p) => <td key={p.tournament_name} className="border border-gray-700 px-3 py-2">${p.earnings.toLocaleString()}</td>)}
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