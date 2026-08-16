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
        <div>
            <h1>{playerName}</h1>

            <table>
                <tbody>
                    <tr>
                        <th>Event</th>
                        {placements.map((p) => <td key={p.tournament_name}>{p.tournament_name}</td>)}
                    </tr>
                    <tr>
                        <th>Date</th>
                        {placements.map((p) => (
                            <td key={p.tournament_name}>
                                {p.start_date === p.end_date ? p.start_date : `${p.start_date} - ${p.end_date}`}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Gamemode</th>
                        {placements.map((p) => <td key={p.tournament_name}>{p.gamemode}</td>)}
                    </tr>
                    <tr>
                        <th>Placement</th>
                        {placements.map((p) => <td key={p.tournament_name}>{p.placement}</td>)}
                    </tr>
                    <tr>
                        <th>Earnings</th>
                        {placements.map((p) => <td key={p.tournament_name}>${p.earnings.toLocaleString()}</td>)}
                    </tr>
                    <tr>
                        <th>Region</th>
                        {placements.map((p) => <td key={p.tournament_name}>{p.region}</td>)}
                    </tr>
                    <tr>
                        <th>Total Teams</th>
                        {placements.map((p) => <td key={p.tournament_name}>{p.total_teams}</td>)}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default PlayerProfile