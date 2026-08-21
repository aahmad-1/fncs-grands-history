import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="border-b border-gray-700 px-6 py-4 flex flex-col items-center gap-2 min-[510px]:flex-row min-[510px]:justify-center min-[510px]:gap-6 min-[510px]:justify-start">
            <Link to="/" className="font-bold text-lg">FNCS Grands History</Link>
            <div className="flex flex-wrap justify-center gap-6">
                <Link to="/players" className="text-gray-400 hover:text-white transition-colors">Players</Link>
                <Link to="/tournaments" className="text-gray-400 hover:text-white transition-colors">Tournaments</Link>
                <Link to="/rankings" className="text-gray-400 hover:text-white transition-colors">Rankings</Link>
            </div>
        </nav>
    )
}

export default Navbar