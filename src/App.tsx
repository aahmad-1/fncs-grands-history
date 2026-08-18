import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Tournaments from './pages/Tournaments'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/players" element={<Players />} />
                <Route path="/players/:playerId" element={<PlayerProfile />} />
                <Route path="/tournaments" element={<Tournaments />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App