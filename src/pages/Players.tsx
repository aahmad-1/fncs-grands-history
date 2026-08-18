import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { AliasMatch } from '../types/player'

interface Player {
    liquipedia_id: string
    display_name: string
}

// some players share the same display name but have different liquipedia id's
// if that happens, swap their name for their id instead
// so the user can actually tell them apart in the search results
const differentiateDisplayNames = (players: Player[]): Player[] => {
    const nameCounts = new Map<string, number>()
    players.forEach((p) => {
        nameCounts.set(p.display_name, (nameCounts.get(p.display_name) ?? 0) + 1)
    })

    return players.map((p) => {
        if ((nameCounts.get(p.display_name) ?? 0) > 1) {
            const cleanId = p.liquipedia_id.replace('/fortnite/', '').replace(/_/g, ' ')
            return { ...p, display_name: cleanId }
        }
        return p
    })
}

const Players = () => {
    const [query, setQuery] = useState<string>('')
    const [results, setResults] = useState<Player[]>([])

    useEffect(() => {
        // don't bother querying supabase until the user actually typed something useful
        if (query.length < 2) {
            setResults([])
            return
        }

    const searchPlayers = async () => {
        // searches current names and pat/alias names at same time
        const [nameMatches, aliasMatches] = await Promise.all([
            supabase
                .from('players')
                .select('liquipedia_id, display_name')
                .ilike('display_name', `%${query}%`)
                .limit(10),
            supabase
                .from('player_aliases')
                .select('player_id, players(liquipedia_id, display_name)')
                .ilike('display_name', `%${query}%`)
                .limit(10)
        ])

        const combined = [
            ...(nameMatches.data ?? []),
            ...((aliasMatches.data ?? []) as unknown as AliasMatch[]).map((a) => a.players)
        ]

        // a player could technically match both queries (old name AND current name both contain the search term)
        // uniquePlayers filter by liquipedia id to prevent this display duplication
        const uniquePlayers = Array.from(
            new Map(combined.map((p) => [p.liquipedia_id, p])).values()
        )

        setResults(differentiateDisplayNames(uniquePlayers.slice(0, 10)))
    }

        searchPlayers()
    }, [query])

    return (
        <div className="flex flex-col items-center text-center">
            <h1>Search an FNCS Grands Finalist</h1>
            <input
                type="text"
                placeholder="Search players..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-600 focus:border-gray-400 bg-gray-900 px-3 py-2 rounded transition-colors outline-none"
            />
            <ul>
                {results.map((player) => (
                    <li key={player.liquipedia_id}>
                        <Link to={`/players/${encodeURIComponent(player.liquipedia_id.replace('/fortnite/', ''))}`}>
                            {player.display_name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Players