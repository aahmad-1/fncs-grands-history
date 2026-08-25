import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Skeleton from '../components/Skeleton'
import { GoDatabase, FaRegUser, MdOutlineLeaderboard, TbDatabaseImport } from '../constants/icons'

interface RegionData {
    region: string
    gamemode: number
    prize_pool: number
}

interface LeaderboardRow {
    placement: number
    earnings: number
    players: { display_name: string }[]
}

const Home = () => {
    const [latestName, setLatestName] = useState<string>('')
    const [regionData, setRegionData] = useState<RegionData[]>([])
    const [latestRegions, setLatestRegions] = useState<string[]>([])
    const [selectedRegion, setSelectedRegion] = useState<string>('')
    const [latestLeaderboard, setLatestLeaderboard] = useState<LeaderboardRow[]>([])

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<number | undefined>(undefined)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchLatest = async () => {
            // find the most recent tournament by date first, regardless of region
            const { data: latestByDate } = await supabase
                .from('tournaments')
                .select('name')
                .order('start_date', { ascending: false })
                .limit(1)
                .single()

            if (!latestByDate) return

            // then grab every region that tournament ran in, so we can pick the preferred one
            // and also keep each regions own total_teams/prize_pool so the card can update when the dropdown changes
            const { data: allRegions } = await supabase
                .from('tournaments')
                .select('region, gamemode, prize_pool')
                .eq('name', latestByDate.name)

            if (!allRegions || allRegions.length === 0) return

            setLatestName(latestByDate.name)
            setRegionData(allRegions)

            const regions = allRegions.map((r) => r.region)
            setLatestRegions(regions)
            setSelectedRegion(regions.includes('Global') ? 'Global' : regions.includes('NAC') ? 'NAC' : 'NAE')
        }

        fetchLatest()
    }, [])

    useEffect(() => {
        if (!latestName || !selectedRegion) return

        const fetchLeaderboardPreview = async () => {
            const { data: tournamentRow } = await supabase
                .from('tournaments')
                .select('id')
                .eq('name', latestName)
                .eq('region', selectedRegion)
                .single()

            if (!tournamentRow) return

            const { data } = await supabase
                .from('placements')
                .select('placement, earnings, placement_players ( players ( display_name ) )')
                .eq('tournament_id', tournamentRow.id)
                .order('placement')
                .limit(50)

            const rows: LeaderboardRow[] = (data ?? []).map((row: any) => ({
                placement: row.placement,
                earnings: row.earnings,
                players: row.placement_players.map((pp: any) => pp.players)
            }))

            setLatestLeaderboard(rows)
        }

        fetchLeaderboardPreview()
    }, [latestName, selectedRegion])

    const scrollPositionRef = useRef(0)
    // slowly auto scrolls the leaderboard preview while hovering, loops back to top instead of stopping
    const startAutoScroll = () => {
        const el = scrollContainerRef.current
        if (!el) return

        const step = () => {
            scrollPositionRef.current += 0.3
            if (scrollPositionRef.current >= el.scrollHeight - el.clientHeight) {
                scrollPositionRef.current = 0
            }
            el.scrollTop = scrollPositionRef.current
            animationFrameRef.current = requestAnimationFrame(step)
        }
        animationFrameRef.current = requestAnimationFrame(step)
    }

    // stops the scroll and snaps back to the top once the mouse leaves
    const stopAutoScroll = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        scrollPositionRef.current = 0
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
    }

    const currentRegionData = regionData.find((r) => r.region === selectedRegion)

    return (
        <div className="p-6 max-w-5xl mx-auto ">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 b">FNCS Grands History</h1>
                <p className="text-gray-400 text-lg mb-8 b">
                    Every FNCS Grand Finals, every region, every player, all in one place.
                </p>
                <div className="flex justify-center gap-4 mt-4">
                    <Link to="/players" className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded font-semibold">
                        Search Players
                    </Link>
                    <Link to="/tournaments" className="bg-gray-800 hover:bg-gray-700 transition-colors px-6 py-3 rounded font-semibold border border-gray-700">
                        Browse Tournaments
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-3">
                            <GoDatabase size={18} />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">Complete Records</h3>
                        <p className="text-sm text-gray-400 leading-6">Every FNCS Grand Finals from Season X to today, across every region it ran in.</p>
                    </div>

                    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-3">
                            <FaRegUser size={16} />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">Player Profiles</h3>
                        <p className="text-sm text-gray-400 leading-6">Full placement history, earnings, and teammates for every qualified player.</p>
                    </div>

                    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-3">
                            <MdOutlineLeaderboard size={18} />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">Consistency Rankings</h3>
                        <p className="text-sm text-gray-400 leading-6">Who's shown up the most, earned the most, and performed the most consistently.</p>
                    </div>

                    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-3">
                            <TbDatabaseImport size={18} />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">Data Source</h3>
                        <p className="text-sm text-gray-400 leading-6">Player results and earnings sourced from Liquipedia's FNCS archives.</p>
                    </div>
                </div>

                {!latestName || latestLeaderboard.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-400 tracking-wide">MOST RECENT EVENT</p>
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="mb-4">
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="mt-auto flex flex-col gap-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-full" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div
                    onClick={() => navigate(`/tournaments/${latestName}?region=${selectedRegion}`)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col transition-colors duration-200 hover:border-blue-400 relative overflow-hidden cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-400 tracking-wide">MOST RECENT EVENT</p>
                            {latestRegions.length > 1 && (
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-xs"
                                >
                                    {latestRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            )}
                        </div>

                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-blue-400 mb-1">{latestName.replace(/_/g, ' ')}</h2>
                            <p className="text-gray-400">
                                {currentRegionData?.gamemode} · ${currentRegionData?.prize_pool.toLocaleString()}
                            </p>
                        </div>

                        {/* real auto scroll instead of a css transform, loops back to top and only moves while hovering */}
                        <div
                            ref={scrollContainerRef}
                            className="mt-auto h-64 overflow-y-hidden relative"
                            onMouseEnter={startAutoScroll}
                            onMouseLeave={stopAutoScroll}
                        >
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-900">
                                    <tr>
                                        <th className="text-left px-2 py-1 text-gray-400 font-normal">#</th>
                                        <th className="text-left px-2 py-1 text-gray-400 font-normal">Players</th>
                                        <th className="text-right px-2 py-1 text-gray-400 font-normal">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestLeaderboard.map((row) => (
                                        <tr key={row.placement} className="border-t border-gray-700">
                                            <td className="px-2 py-1.5 text-gray-400">{row.placement}</td>
                                            <td className="px-2 py-1.5 truncate max-w-[140px]">
                                                {row.players.map((p) => p.display_name).join(', ')}
                                            </td>
                                            <td className="px-2 py-1.5 text-right text-gray-300">${row.earnings.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home