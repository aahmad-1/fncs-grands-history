import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { CHAPTERS } from '../constants/chapters'
import { formatDate } from '../utils/formatDate'
import Skeleton from '../components/Skeleton'

interface TournamentCard {
    name: string
    gamemode: string
    start_date: string
    end_date: string
    regions: string[]
}

// figures out which chapter a tournament falls into based on its start date
const getChapterForDate = (dateStr: string): number => {
    const found = CHAPTERS.find((c) => dateStr >= c.start && dateStr <= c.end)
    return found ? found.chapter : 0
}

const Tournaments = () => {
    const [query, setQuery] = useState<string>('')
    const [tournaments, setTournaments] = useState<TournamentCard[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // foilters
    const [chapterFilter, setChapterFilter] = useState<number | null>(null)
    const [gamemodeFilter, setGamemodeFilter] = useState<Set<string>>(
        new Set(['Solos', 'Duos', 'Trios', 'Squads'])
    )

    useEffect(() => {
        const fetchTournaments = async () => {
            const { data, error } = await supabase
                .from('tournaments')
                .select('name, gamemode, start_date, end_date, region')

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            // same event name shows up once per region, group them so each event only appears once on this page
            const grouped = new Map<string, TournamentCard>()
            for (const row of data ?? []) {
                if (!grouped.has(row.name)) {
                    grouped.set(row.name, {
                        name: row.name,
                        gamemode: row.gamemode,
                        start_date: row.start_date,
                        end_date: row.end_date,
                        regions: []
                    })
                }
                grouped.get(row.name)!.regions.push(row.region)
            }

            const uniqueTournaments = Array.from(grouped.values())
            uniqueTournaments.sort((a, b) => b.start_date.localeCompare(a.start_date))

            setTournaments(uniqueTournaments)
            setLoading(false)
        }

        fetchTournaments()
    }, [])

    const filtered = tournaments.filter((t) => {
        const matchesSearch = t.name.toLowerCase().replace(/_/g, ' ').includes(query.toLowerCase())
        const matchesGamemode = gamemodeFilter.has(t.gamemode)
        const matchesChapter = chapterFilter === null || getChapterForDate(t.start_date) === chapterFilter
        return matchesSearch && matchesGamemode && matchesChapter
    })

    // group filtered results by chapter in descending order
    const byChapter = new Map<number, TournamentCard[]>()
    for (const t of filtered) {
        const chapter = getChapterForDate(t.start_date)
        if (!byChapter.has(chapter)) byChapter.set(chapter, [])
        byChapter.get(chapter)!.push(t)
    }
    const sortedChapters = Array.from(byChapter.keys()).sort((a, b) => b - a)

    return (
        <div className="p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-center">Search an FNCS Grands Tournament</h1>
            <input
                type="text"
                placeholder="Search tournaments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-600 focus:border-gray-400 bg-gray-900 px-3 py-2 rounded transition-colors outline-none mb-8 w-full max-w-md"
            />
            <div className="mb-8 flex flex-wrap justify-center items-center gap-4 text-sm">
                <div className='flex flex-wrap justify-center items-center'>
                    <span className="font-semibold mr-2">Chapter:</span>
                    <select
                        value={chapterFilter ?? ''}
                        onChange={(e) => setChapterFilter(e.target.value === '' ? null : Number(e.target.value))}
                        className="bg-gray-800 border border-gray-700 px-2 py-1 rounded"
                    >
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5, 6, 7].map((c) => <option key={c} value={c}>Chapter {c}</option>)}
                    </select>
                </div>
                <div className='flex flex-wrap justify-center'>
                    <span className="font-semibold mr-2">Gamemode:</span>
                    {['Solos', 'Duos', 'Trios', 'Squads'].map((mode) => (
                        <label key={mode} className="mr-3 whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={gamemodeFilter.has(mode)}
                                onChange={() => {
                                    const updated = new Set(gamemodeFilter)
                                    updated.has(mode) ? updated.delete(mode) : updated.add(mode)
                                    setGamemodeFilter(updated)
                                }}
                            />{' '}{mode}
                        </label>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>
            ) : (
                sortedChapters.map((chapter) => (
                    <div key={chapter} className="w-full max-w-6xl mb-8">
                        <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4">Chapter {chapter}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {byChapter.get(chapter)!.map((t) => {
                                const defaultRegion = t.regions.includes('Global') ? 'Global' : t.regions.includes('NAE') ? 'NAE' : 'NAC'
                                return (
                                    <Link
                                        key={t.name}
                                        to={`/tournaments/${t.name}?region=${defaultRegion}`}
                                        className="border border-transparent hover:border-blue-400 bg-gray-800 rounded-lg p-4 transition-transform duration-200 hover:scale-105"
                                    >
                                        <h3 className="text-lg font-semibold">{t.name.replace(/_/g, ' ')}</h3>
                                        <p className="text-sm text-gray-400">{t.gamemode}</p>
                                        <p className="text-sm text-gray-400">{t.start_date === t.end_date ? formatDate(t.start_date) : `${formatDate(t.start_date)} - ${formatDate(t.end_date)}`}</p>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default Tournaments