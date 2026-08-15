import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface PlacementRow {
    placement: number
    earnings: number
    tournament_name: string
    gamemode: string
    region: string
    start_date: string
    end_date: string
    total_teams: number
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
                placement: row.placements.placement,
                earnings: row.placements.earnings,
                tournament_name: row.placements.tournaments.name,
                gamemode: row.placements.tournaments.gamemode,
                region: row.placements.tournaments.region,
                start_date: row.placements.tournaments.start_date,
                end_date: row.placements.tournaments.end_date,
                total_teams: row.placements.tournaments.total_teams
            }))

            setPlacements(rows)
            setLoading(false)
        }

        fetchPlayerData()
    }, [playerId])

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <h1>{playerName}</h1>
            <p>{placements.length} FNCS Grands entries found</p>
        </div>
    )
}

export default PlayerProfile