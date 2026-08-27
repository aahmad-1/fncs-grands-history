import { Link, useLocation  } from 'react-router-dom'

const Navbar = () => {
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="border-b border-gray-700 px-6 py-4 flex flex-col items-center gap-2 min-[510px]:flex-row min-[510px]:justify-center min-[510px]:gap-6 min-[510px]:justify-start">
            <Link to="/" className="font-bold text-lg">FNCS Grands History</Link>
            <div className="flex flex-wrap justify-center gap-6">
                <Link to="/players" className={isActive('/players') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Players</Link>
                <Link to="/tournaments" className={isActive('/tournaments') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Tournaments</Link>
                <Link to="/rankings" className={isActive('/rankings') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>Rankings</Link>
                <Link to="/history" className={isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'}>History</Link>
            </div>
        </nav>
    )
}

export default Navbar