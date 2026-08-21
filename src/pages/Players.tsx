import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { AliasMatch } from '../types/player'
import { differentiateDisplayNames } from '../utils/differentiateDisplayNames'
import Pagination from '../components/Pagination'
import Skeleton from '../components/Skeleton'

interface Player {
    liquipedia_id: string
    display_name: string
}

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '0-9']
const PAGE_SIZE = 25

const Players = () => {
    const [query, setQuery] = useState<string>('')
    const [results, setResults] = useState<Player[]>([])

    const [allPlayers, setAllPlayers] = useState<Player[]>([])
    const [loadingAll, setLoadingAll] = useState<boolean>(true)
    const [letterFilter, setLetterFilter] = useState<string | null>(null)
    const [page, setPage] = useState<number>(1)

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const searchPlayers = async () => {
            const [nameMatches, idMatches, aliasMatches] = await Promise.all([
                supabase.from('players').select('liquipedia_id, display_name').ilike('display_name', `%${query}%`).limit(10),
                supabase.from('players').select('liquipedia_id, display_name').ilike('liquipedia_id', `%${query}%`).limit(10),
                supabase.from('player_aliases').select('player_id, players(liquipedia_id, display_name)').ilike('display_name', `%${query}%`).limit(10)
            ])

            const combined = [
                ...(nameMatches.data ?? []),
                ...(idMatches.data ?? []),
                ...((aliasMatches.data ?? []) as unknown as AliasMatch[]).map((a) => a.players)
            ]

            const uniquePlayers = Array.from(new Map(combined.map((p) => [p.liquipedia_id, p])).values())
            setResults(differentiateDisplayNames(uniquePlayers.slice(0, 10)))
        }

        searchPlayers()
    }, [query])

    // full browse list, batched since supabase caps a single request at 1000 rows
    useEffect(() => {
        const fetchAllPlayers = async () => {
            const all: Player[] = []
            let from = 0
            const batchSize = 1000

            while (true) {
                const { data, error } = await supabase
                    .from('players')
                    .select('liquipedia_id, display_name')
                    .order('display_name')
                    .order('liquipedia_id')
                    .range(from, from + batchSize - 1)

                if (error) { console.error(error); break }
                if (!data || data.length === 0) break

                all.push(...data)
                if (data.length < batchSize) break
                from += batchSize
            }

            setAllPlayers(differentiateDisplayNames(all))
            setLoadingAll(false)
        }

        fetchAllPlayers()
    }, [])

    const filteredPlayers = allPlayers.filter((p) => {
        if (!letterFilter) return true
        const firstChar = p.display_name[0]?.toUpperCase() ?? ''
        if (letterFilter === '0-9') return /[0-9]/.test(firstChar)
        return firstChar === letterFilter
    })

    const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE))
    const pageRows = filteredPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="flex flex-col items-center text-center p-6">
            <h1 className="text-4xl font-bold mb-4 px-4 leading-snug">
                Search an FNCS{' '}
                <span className="whitespace-nowrap">Grands Finalist</span>
            </h1>
            <input
                type="text"
                placeholder="Search players..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-600 focus:border-gray-400 bg-gray-900 px-3 py-2 rounded transition-colors outline-none mb-2"
            />
            <ul className="mb-8">
                {results.map((player) => (
                    <li key={player.liquipedia_id}>
                        <Link to={`/players/${encodeURIComponent(player.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                            {player.display_name}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="flex flex-wrap justify-center gap-1 mb-6 max-w-2xl">
                <button onClick={() => { setLetterFilter(null); setPage(1) }} className={`px-2 py-1 rounded text-sm ${letterFilter === null ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}>All</button>
                {ALPHABET.map((letter) => (
                    <button key={letter} onClick={() => { setLetterFilter(letter); setPage(1) }} className={`px-2 py-1 rounded text-sm ${letterFilter === letter ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}>{letter}</button>
                ))}
            </div>

            {loadingAll ? (
                <div className="w-full max-w-md flex flex-col gap-2 mb-6">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            ) : (
                <>
                    <ol className="w-full max-w-md text-left mb-6">
                        {pageRows.map((player, i) => (
                            <li key={player.liquipedia_id} className="border-b border-gray-800 py-2 flex gap-3">
                                <span className="text-gray-500 w-8">{(page - 1) * PAGE_SIZE + i + 1}.</span>
                                <Link to={`/players/${encodeURIComponent(player.liquipedia_id.replace('/fortnite/', ''))}`} className="text-blue-400 hover:underline">
                                    {player.display_name}
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </div>
    )
}

export default Players