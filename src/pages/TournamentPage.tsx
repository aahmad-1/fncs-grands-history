import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LOGO_URLS } from '../constants/logos'

interface TournamentInfo {
    region: string
    gamemode: string
    prize_pool: number
    play_setting: string
    location: string
    venue: string | null
    total_teams: number
    start_date: string
    end_date: string
    logo_key: string | null
}

interface LeaderboardEntry {
    placement: number
    earnings: number
    disqualified: boolean
    players: { liquipedia_id: string, display_name: string }[]
}

const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString()

const TournamentPage = () => {
    const { tournamentName } = useParams<{ tournamentName: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const region = searchParams.get('region') ?? 'NAE'

    const [info, setInfo] = useState<TournamentInfo | null>(null)
    const [availableRegions, setAvailableRegions] = useState<string[]>([])
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchTournamentData = async () => {
            // grabbing every region this event ran in so the dropdown only shows real options
            const { data: allRegionsData } = await supabase
                .from('tournaments')
                .select('region')
                .eq('name', tournamentName)

            setAvailableRegions((allRegionsData ?? []).map((r) => r.region))

            const { data: tournamentData, error: tournamentError } = await supabase
                .from('tournaments')
                .select('id, region, gamemode, prize_pool, play_setting, location, venue, total_teams, start_date, end_date, logo_key')
                .eq('name', tournamentName)
                .eq('region', region)
                .single()

            if (tournamentError || !tournamentData) {
                console.error(tournamentError)
                setLoading(false)
                return
            }

            setInfo(tournamentData)

            const { data: placementsData, error: placementsError } = await supabase
                .from('placements')
                .select('placement, earnings, disqualified, placement_players ( players ( liquipedia_id, display_name ) )')
                .eq('tournament_id', tournamentData.id)
                .order('placement')

            if (placementsError) {
                console.error(placementsError)
                setLoading(false)
                return
            }

            const rows: LeaderboardEntry[] = (placementsData ?? []).map((row: any) => ({
                placement: row.placement,
                earnings: row.earnings,
                disqualified: row.disqualified,
                players: row.placement_players.map((pp: any) => pp.players)
            }))

            setLeaderboard(rows)
            setLoading(false)
        }

        fetchTournamentData()
    }, [tournamentName, region])

    if (loading) return <p className="text-center">Loading...</p>
    if (!info) return <p className="text-center">Tournament not found for this region.</p>

    const logoUrl = info.logo_key ? LOGO_URLS[info.logo_key] : null
    const displayName = tournamentName?.replace(/_/g, ' ')

    return (
        <div className="flex flex-col min-[622px]:flex-row h-auto min-[622px]:h-screen overflow-x-hidden">

            <div className="flex flex-col items-center w-full min-[622px]:w-72 shrink-0 border-r-0 min-[622px]:border-r border-b min-[622px]:border-b-0 border-gray-700 p-4 gap-1">
                <Link to="/tournaments" className="text-blue-400 hover:underline text-sm self-start mb-2">← Back to tournaments</Link>

                <h1 className="text-2xl font-bold text-center mb-4">{displayName}</h1>

                {logoUrl && <img src={logoUrl} alt={displayName} className="w-48 mb-4 rounded" />}

                <div className="w-full max-w-xs mx-auto bg-gray-800 rounded-lg p-4 flex flex-col gap-2 text-sm items-center">
                    {info.start_date === info.end_date ? (
                        <p><span className="text-gray-400">Date:</span> {formatDate(info.start_date)}</p>
                    ) : (
                        <>
                            <p><span className="text-gray-400">Start Date:</span> {formatDate(info.start_date)}</p>
                            <p><span className="text-gray-400">End Date:</span> {formatDate(info.end_date)}</p>
                        </>
                    )}
                    <p><span className="text-gray-400">Total Teams:</span> {info.total_teams}</p>
                    <p><span className="text-gray-400">Prize Pool:</span> ${info.prize_pool.toLocaleString()}</p>
                    <p><span className="text-gray-400">Type:</span> {info.play_setting}</p>
                    {info.region === 'Global' && <p><span className="text-gray-400">Location:</span> {info.location}</p>}
                    {info.venue && <p><span className="text-gray-400">Venue:</span> {info.venue}</p>}
                    
                    {/* // only show the region dropdown if this event actually ran in more than one region, otherwise just print it */}
                    {availableRegions.length > 1 ? (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-700 mt-2">
                            <label className="text-gray-400">Region:</label>
                            <select value={region} onChange={(e) => setSearchParams({ region: e.target.value })} className="bg-gray-900 border border-gray-700 px-2 py-1 rounded">
                                {availableRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    ) : (
                        <p className="pt-2 border-t border-gray-700 mt-2"><span className="text-gray-400">Region:</span> {info.region}</p>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full overflow-y-visible min-[622px]:overflow-y-auto p-6">
                <table className="border-collapse border border-gray-700 text-sm mx-auto">
                    <thead>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-white">Placement</th>
                            <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-white">Players</th>
                            <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-white">Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((row) => (
                            <tr key={row.placement}>
                                <td className="border border-gray-700 px-3 py-2 text-center">
                                    {row.disqualified ? 'DQ' : row.placement}
                                </td>
                                <td className="border border-gray-700 px-3 py-2 text-center">
                                    {row.players.map((p, i) => (
                                        <span key={p.liquipedia_id}>
                                            <Link to={`/players/${encodeURIComponent(p.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                                {p.display_name}
                                            </Link>
                                            {i < row.players.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </td>
                                <td className="border border-gray-700 px-3 py-2 text-center">${row.earnings.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* <div className="flex-1 w-full overflow-y-visible min-[622px]:overflow-y-auto p-2 sm:p-6 flex justify-center">
                <div className="w-full overflow-x-auto flex justify-center">
                    <table className="w-full max-w-full border-collapse border border-gray-700 text-xs sm:text-sm mx-auto">
                        <thead>
                            <tr>
                                <th className="border border-gray-700 bg-gray-800 px-2 sm:px-3 py-2 text-white">Placement</th>
                                <th className="border border-gray-700 bg-gray-800 px-2 sm:px-3 py-2 text-white">Players</th>
                                <th className="border border-gray-700 bg-gray-800 px-2 sm:px-3 py-2 text-white">Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((row) => (
                                <tr key={row.placement}>
                                    <td className="border border-gray-700 px-2 sm:px-3 py-2 text-center font-medium">{row.placement}</td>
                                    <td className="border border-gray-700 px-2 sm:px-3 py-2 text-center">
                                        <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-0.5">
                                            {row.players.map((p, i) => (
                                                <span key={p.liquipedia_id} className="whitespace-nowrap">
                                                    <Link to={`/players/${encodeURIComponent(p.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                                        {p.display_name}
                                                    </Link>
                                                    {i < row.players.length - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="border border-gray-700 px-2 sm:px-3 py-2 text-center whitespace-nowrap">
                                        ${row.earnings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> */}
        </div>
    )
}

export default TournamentPage