import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { differentiateDisplayNames } from '../utils/differentiateDisplayNames'
import Pagination from '../components/Pagination'
import Skeleton from '../components/Skeleton'
import { FaSortUp, FaSortDown } from '../constants/icons'

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

type SortableKey = keyof Omit<RankingRow, 'liquipedia_id' | 'display_name'> | 'display_name'

const PAGE_SIZE = 25

const Rankings = () => {
    const [rankings, setRankings] = useState<RankingRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [sortKey, setSortKey] = useState<SortableKey>('total_earnings')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [minQualified, setMinQualified] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [minQualifiedInput, setMinQualifiedInput] = useState<string>('1')

    useEffect(() => {
        const fetchRankings = async () => {
            const allRows: RankingRow[] = []
            let from = 0
            const batchSize = 1000

            while (true) {
                const { data, error } = await supabase
                    .from('player_rankings')
                    .select('*')
                    .order('liquipedia_id') // pagination needs an explicit order or supabase can return rows in a different order each batch, causing missing/duplicate/unordered players
                    .range(from, from + batchSize - 1) // looping since supabase caps a single request at 1000 rows, this grabs everything in batches

                if (error) {
                    console.error(error)
                    break
                }
                if (!data || data.length === 0) break

                allRows.push(...data)
                if (data.length < batchSize) break
                from += batchSize
            }

            setRankings(differentiateDisplayNames(allRows))
            setLoading(false)
        }
        fetchRankings()
    }, [])

    // clicking the same column flips its direction, clicking a new column always starts on descending
    const handleSort = (key: SortableKey) => {
        if (key === sortKey) {
            setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
        } else {
            setSortKey(key)
            setSortDirection('desc')
        }
        setPage(1)
    }

    const filtered = rankings.filter((r) => r.events_qualified >= (Number(minQualifiedInput) || 1))

    // display_name is sorted alphabetically, everything else is sorted numerically, direction flips whichever way the comparator result gets negated
    const sorted = [...filtered].sort((a, b) => {
        const cmp = sortKey === 'display_name'
            ? a.display_name.localeCompare(b.display_name)
            : a[sortKey] - b[sortKey]
        return sortDirection === 'desc' ? -cmp : cmp
    })

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
    const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const columns: { key: SortableKey, label: string }[] = [
        { key: 'wins', label: 'Wins' },
        { key: 'top3', label: 'Top 3' },
        { key: 'top5', label: 'Top 5' },
        { key: 'top10', label: 'Top 10' },
        { key: 'events_qualified', label: 'Grands Qualified' },
        { key: 'avg_placement', label: 'Average Placement' },
        { key: 'total_earnings', label: 'Total Earnings' }
    ]

    // up arrow lit up means descending, down arrow lit up means ascending, both stay dark if this column isnt the active sort
    const SortIcon = ({ column }: { column: SortableKey }) => {
        const isActive = sortKey === column
        return (
            <span className="inline-flex flex-col -space-y-[14px] ml-1 align-middle">
                <FaSortUp className={isActive && sortDirection === 'desc' ? 'text-white' : 'text-gray-600'} />
                <FaSortDown className={isActive && sortDirection === 'asc' ? 'text-white' : 'text-gray-600'} />
            </span>
        )
    }

    return (
        <div className="p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-center">Player Rankings</h1>

            <label className="mb-6">
                Minimum grands qualified:{' '}
                <input
                    type="number"
                    min={1}
                    value={minQualifiedInput}
                    onChange={(e) => { setMinQualifiedInput(e.target.value); setPage(1) }}
                    onBlur={() => { if (minQualifiedInput === '') setMinQualifiedInput('1') }}
                    className="w-16 bg-gray-800 border border-gray-700 px-1"
                />
            </label>

            {loading ? (
                <div className="w-full max-w-4xl flex flex-col gap-2">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto w-full mb-6">
                        <table className="border-collapse border border-gray-700 text-sm mx-auto">
                            <thead>
                                <tr>
                                    <th className="border border-gray-700 bg-gray-800 px-3 py-2">#</th>
                                    <th
                                        onClick={() => handleSort('display_name')}
                                        className="border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:text-white text-gray-400 px-3 py-2 cursor-pointer transition-colors"
                                    >
                                        Player <SortIcon column="display_name" />
                                    </th>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className={`border border-gray-700 bg-gray-800 hover:bg-gray-700 px-3 py-2 cursor-pointer whitespace-nowrap transition-colors align-middle ${sortKey === col.key ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {col.label} <SortIcon column={col.key} />
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

                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </div>
    )
}

export default Rankings