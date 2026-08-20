import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="border-b border-gray-700 px-6 py-4 flex items-center gap-6">
            <Link to="/" className="font-bold text-lg">FNCS Grands History</Link>
            <Link to="/players" className="text-gray-400 hover:text-white transition-colors">Players</Link>
            <Link to="/tournaments" className="text-gray-400 hover:text-white transition-colors">Tournaments</Link>
            <Link to="/rankings" className="text-gray-400 hover:text-white transition-colors">Rankings</Link>
        </nav>
    )
}

export default Navbar