import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Tournaments from './pages/Tournaments'
import TournammentPage from './pages/TournamentPage'


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/players" element={<Players />} />
                <Route path="/players/:playerId" element={<PlayerProfile />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/tournaments/:tournamentName" element={<TournammentPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App