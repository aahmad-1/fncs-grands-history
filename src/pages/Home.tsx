import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Skeleton from '../components/Skeleton'

interface LatestTournament {
    name: string
    region: string
    total_teams: number
    prize_pool: number
}

const Home = () => {
    const [latest, setLatest] = useState<LatestTournament | null>(null)

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
            const { data: allRegions } = await supabase
                .from('tournaments')
                .select('name, region, total_teams, prize_pool')
                .eq('name', latestByDate.name)

            if (!allRegions || allRegions.length === 0) return

            const preferredRegion = allRegions.find((t) => t.region === 'Global')
                ?? allRegions.find((t) => t.region === 'NAC')
                ?? allRegions.find((t) => t.region === 'NAE')
                ?? allRegions[0]

            setLatest(preferredRegion)
        }

        fetchLatest()
    }, [])

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

            {latest ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-12">
                    <p className="text-xs font-semibold text-gray-400 mb-2">MOST RECENT EVENT</p>
                    <Link to={`/tournaments/${latest.name}?region=${latest.region}`} className="text-2xl font-bold text-blue-400 hover:underline">
                        {latest.name.replace(/_/g, ' ')}
                    </Link>
                    <p className="text-gray-400 mt-1">{latest.total_teams} teams · ${latest.prize_pool.toLocaleString()} prize pool</p>
                </div>
            ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-12">
                    <Skeleton className="h-3 w-32 mb-3" />
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold mb-2">Complete Records</h3>
                    <p className="text-gray-400 text-sm">Every FNCS Grand Finals from Season X to today, across every region it ran in.</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold mb-2">Player Profiles</h3>
                    <p className="text-gray-400 text-sm">Full placement history, earnings, and teammates for every player who's ever qualified for a grands.</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold mb-2">Consistency Rankings</h3>
                    <p className="text-gray-400 text-sm">See who's shown up the most, earned the most, and performed the most consistently over time.</p>
                </div>
            </div>
        </div>
    )
}

export default Home