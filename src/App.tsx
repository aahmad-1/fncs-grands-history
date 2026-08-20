import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Tournaments from './pages/Tournaments'
import TournammentPage from './pages/TournamentPage'
import Rankings from './pages/Rankings'


function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/players" element={<Players />} />
                <Route path="/players/:playerId" element={<PlayerProfile />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/tournaments/:tournamentName" element={<TournammentPage />} />
                <Route path="/rankings" element={<Rankings />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App