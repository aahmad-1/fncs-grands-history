import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface Player {
    liquipedia_id: string
    display_name: string
}

const Players = () => {
    const [query, setQuery] = useState<string>('')
    const [results, setResults] = useState<Player[]>([])

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const searchPlayers = async () => {
            const { data, error } = await supabase
                .from('players')
                .select('liquipedia_id, display_name')
                .ilike('display_name', `%${query}%`)
                .limit(10)

            if (error) {
                console.error(error)
                return
            }

            setResults(data)
        }

        searchPlayers()
    }, [query])

    return (
        <div>
            <h1>Search an FNCS Grands Finalist</h1>
            <input
                type="text"
                placeholder="Search players..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul>
                {results.map((player) => (
                    <li key={player.liquipedia_id}>
                        <Link to={`/players/${encodeURIComponent(player.liquipedia_id)}`}>
                            {player.display_name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Players