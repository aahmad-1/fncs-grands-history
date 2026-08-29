import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatDate } from '../utils/formatDate'
import { LOGO_URLS } from '../constants/logos'
import Skeleton from '../components/Skeleton'

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

    if (loading) {
        return (
            <div className="flex flex-col min-[650px]:flex-row h-auto min-[650px]:h-screen overflow-x-hidden">
                <div className="flex flex-col items-center w-full min-[650px]:w-72 shrink-0 border-gray-700 p-4 gap-1 border-b min-[650px]:border-b-0 min-[650px]:border-r">
                    <Link to="/tournaments" className="text-blue-400 hover:underline text-sm text-center mb-2">← Back to tournaments</Link>
                    <Skeleton className="h-8 w-40 mb-4" />
                    <Skeleton className="w-48 h-48 mb-4 rounded" />
                    <Skeleton className="w-full max-w-72 h-56 rounded-lg" />
                </div>
                <div className="flex-1 w-full min-w-0 overflow-x-auto p-6 min-[650px]:overflow-y-auto">
                    <div className="w-full max-w-[300px] min-[400px]:max-w-xl mx-auto rounded-xl overflow-hidden">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full border-b border-gray-800 last:border-b-0" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!info) return <p className="text-center">Tournament not found for this region.</p>

    const logoUrl = info.logo_key ? LOGO_URLS[info.logo_key] : null
    const displayName = tournamentName?.replace(/_/g, ' ')

    return (
        <div className="flex flex-col min-[650px]:flex-row h-auto min-[650px]:h-screen overflow-x-hidden">


            <div className="flex flex-col items-center w-full min-[650px]:w-72 shrink-0 border-gray-700 p-4 gap-1 border-b min-[650px]:border-b-0 min-[650px]:border-r">
                <Link to="/tournaments" className="text-blue-400 hover:underline text-sm text-center mb-2">← Back to tournaments</Link>

                <h1
                    className="font-bold text-center mb-4 w-full whitespace-nowrap"
                    style={{ fontSize: `clamp(1rem, ${32/ (displayName?.length ?? 10)}rem, 1.875rem)` }}
                >
                    {displayName}
                </h1>

                {logoUrl && <img src={logoUrl} alt={displayName} className="w-48 mb-4 rounded" />}

                <div className="w-full max-w-72 mx-auto bg-gray-800 rounded-lg p-4 flex flex-col gap-2 text-sm">
                    {info.start_date === info.end_date ? (
                        <p><span className="text-gray-400">Date:</span> <span className="text-white font-medium">{formatDate(info.start_date)}</span></p>
                    ) : (
                        <>
                            <p><span className="text-gray-400">Start Date:</span> <span className="text-white font-medium">{formatDate(info.start_date)}</span></p>
                            <p><span className="text-gray-400">End Date:</span> <span className="text-white font-medium">{formatDate(info.end_date)}</span></p>
                        </>
                    )}
                    <p><span className="text-gray-400">Total Teams:</span> <span className="text-white font-medium">{info.total_teams}</span></p>
                    <p><span className="text-gray-400">Prize Pool:</span> <span className="text-white font-medium">${info.prize_pool.toLocaleString()}</span></p>
                    <p><span className="text-gray-400">Type:</span> <span className="text-white font-medium">{info.play_setting}</span></p>
                    {info.region === 'Global' && <p><span className="text-gray-400">Location:</span> <span className="text-white font-medium">{info.location}</span></p>}
                    {info.venue && <p><span className="text-gray-400">Venue:</span> <span className="text-white font-medium">{info.venue}</span></p>}
                    
                    {/* // only show the region dropdown if this event actually ran in more than one region, otherwise just print it */}
                    {availableRegions.length > 1 ? (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-700 mt-2">
                            <label className="text-gray-400">Region:</label>
                            <select value={region} onChange={(e) => setSearchParams({ region: e.target.value })} className="bg-gray-900 border border-gray-700 px-2 py-1 rounded">
                                {availableRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    ) : (
                        <p className="pt-2 border-t border-gray-700 mt-2"><span className="text-gray-400">Region:</span> <span className="text-white font-medium">{info.region}</span></p>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full min-w-0 overflow-x-auto p-6 min-[650px]:overflow-y-auto">
                <table className="table-fixed w-full max-w-[300px] min-[400px]:max-w-xl border-separate border-spacing-0 border border-gray-800 rounded-xl overflow-hidden text-sm mx-auto">
                    <colgroup>
                        <col className="w-20" />
                        <col />
                        <col className="w-20" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="bg-gray-900 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-white font-semibold text-center">Placement</th>
                            <th className="bg-gray-900 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-white font-semibold text-center">Players</th>
                            <th className="bg-gray-900 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-white font-semibold text-center">Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((row) => (
                            <tr key={row.placement} className="bg-gray-800/60 hover:bg-gray-800 transition-colors">
                                <td className="border-t border-gray-800 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-center text-gray-300">
                                    {row.disqualified ? 'DQ' : row.placement}
                                </td>
                                <td className="border-t border-gray-800 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-center break-words overflow-wrap-anywhere">
                                    {row.players.map((p, i) => (
                                        <span key={p.liquipedia_id}>
                                            <Link to={`/players/${encodeURIComponent(p.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                                {p.display_name}
                                            </Link>
                                            {i < row.players.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </td>
                                <td className="border-t border-gray-800 px-2 py-2 min-[400px]:px-4 min-[400px]:py-3 text-center text-gray-300">${row.earnings.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TournamentPage