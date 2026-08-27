import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="border-b border-gray-700 px-6 py-4 flex flex-col items-center gap-2 min-[585px]:flex-row min-[585px]:justify-start min-[585px]:gap-6">
            <Link to="/" className="font-bold text-lg">FNCS Grands History</Link>
            <div className="flex flex-nowrap justify-center items-center gap-3 min-[380px]:gap-6 text-sm min-[380px]:text-base">
                <Link to="/players" className={isActive('/players') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Players</Link>
                <Link to="/tournaments" className={isActive('/tournaments') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Tournaments</Link>
                <Link to="/rankings" className={isActive('/rankings') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Rankings</Link>
                <Link to="/history" className={isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>History</Link>
            </div>
        </nav>
    )
}

export default Navbar