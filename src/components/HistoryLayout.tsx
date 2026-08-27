import { Link, useLocation } from 'react-router-dom'

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path

    const links = [
        { path: '/history', label: 'Introduction' },
        { path: '/history/terminology', label: 'Terminology' },
        { path: '/history/format', label: 'Format & Rules' },
        { path: '/history/limitations', label: 'Limitations' }
    ]

    return (
        <div className="flex flex-col min-[700px]:flex-row min-h-screen">
            <div className="w-full min-[700px]:w-56 shrink-0 border-b min-[700px]:border-b-0 min-[700px]:border-r border-gray-700 p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">ON THIS SITE</p>
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-2 py-1.5 rounded-lg text-sm mb-1 ${isActive(link.path) ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <div className="flex-1 p-6 max-w-3xl">{children}</div>
        </div>
    )
}

export default HistoryLayout