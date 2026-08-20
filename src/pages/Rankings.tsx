import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface RankingRow {
    liquipedia_id: string
    display_name: string
    wins: number
    top3: number
    top5: number
    top10: number
    events_qualified: number
    avg_placement: number
    total_earnings: number
}

type SortKey = keyof Omit<RankingRow, 'liquipedia_id' | 'display_name'>

const PAGE_SIZE = 25

const Rankings = () => {
    const [rankings, setRankings] = useState<RankingRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [sortKey, setSortKey] = useState<SortKey>('total_earnings')
    const [minQualified, setMinQualified] = useState<number>(1)
    const [page, setPage] = useState<number>(1)

    useEffect(() => {
        const fetchRankings = async () => {
            const allRows: RankingRow[] = []
            let from = 0
            const batchSize = 1000

            while (true) {
                const { data, error } = await supabase
                    .from('player_rankings')
                    .select('*')
                    .range(from, from + batchSize - 1)

                if (error) {
                    console.error(error)
                    break
                }
                if (!data || data.length === 0) break

                allRows.push(...data)
                if (data.length < batchSize) break
                from += batchSize
            }

            setRankings(allRows)
            setLoading(false)
        }
        fetchRankings()
    }, [])

    if (loading) return <p className="text-center">Loading...</p>

    const filtered = rankings.filter((r) => r.events_qualified >= minQualified)
    // avg_placement is the only column where lower is better, everything else sorts descending
    const sorted = [...filtered].sort((a, b) =>
        sortKey === 'avg_placement' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    )

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
    const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const columns: { key: SortKey, label: string }[] = [
        { key: 'wins', label: 'Wins' },
        { key: 'top3', label: 'Top 3' },
        { key: 'top5', label: 'Top 5' },
        { key: 'top10', label: 'Top 10' },
        { key: 'events_qualified', label: 'Grands Qualified' },
        { key: 'avg_placement', label: 'Average Placement' },
        { key: 'total_earnings', label: 'Total Earnings' }
    ]

    return (
        <div className="p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Player Rankings</h1>

            <label className="mb-6">
                Minimum grands qualified:{' '}
                <input
                    type="number"
                    min={1}
                    value={minQualified}
                    onChange={(e) => { setMinQualified(Number(e.target.value)); setPage(1) }}
                    className="w-16 bg-gray-800 border border-gray-700 px-1"
                />
            </label>

            <div className="overflow-x-auto w-full">
                <table className="border-collapse border border-gray-700 text-sm mx-auto">
                    <thead>
                        <tr>
                            <th className="border border-gray-700 bg-gray-800 px-3 py-2">#</th>
                            <th className="border border-gray-700 bg-gray-800 px-3 py-2">Player</th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => { setSortKey(col.key); setPage(1) }}
                                    className={`border border-gray-700 px-3 py-2 cursor-pointer whitespace-nowrap ${sortKey === col.key ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((row, i) => (
                            <tr key={row.liquipedia_id}>
                                <td className="border border-gray-700 px-3 py-2 text-center">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                <td className="border border-gray-700 px-3 py-2 whitespace-nowrap">
                                    <Link to={`/players/${encodeURIComponent(row.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                        {row.display_name}
                                    </Link>
                                </td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.wins}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.top3}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.top5}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.top10}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.events_qualified}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">{row.avg_placement}</td>
                                <td className="border border-gray-700 px-3 py-2 text-center">${row.total_earnings.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-2 mt-6 items-center">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded disabled:opacity-30">Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded disabled:opacity-30">Next</button>
            </div>
        </div>
    )
}

export default Rankings