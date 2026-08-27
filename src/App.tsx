import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Tournaments from './pages/Tournaments'
import TournammentPage from './pages/TournamentPage'
import Rankings from './pages/Rankings'
import NotFound from './pages/NotFound'
import ScrollbarTop from './components/ScrollbarTop'
import HistoryIntro from './pages/HistoryIntro'
import HistoryTerminology from './pages/HistoryTerminology'
import HistoryFormat from './pages/HistoryFormat'
import HistoryLimitations from './pages/HistoryLimitations'


function App() {
    return (
        <BrowserRouter>
            <ScrollbarTop />
            <div className="min-h-screen flex flex-col">
                <div className="sticky top-0 z-50 bg-gray-950/43 backdrop-blur-md">
                    <Navbar />
                </div>
                <div className='overflow-x-hidden bg-gray-900 flex-1'>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/players" element={<Players />} />
                        <Route path="/players/:playerId" element={<PlayerProfile />} />
                        <Route path="/tournaments" element={<Tournaments />} />
                        <Route path="/tournaments/:tournamentName" element={<TournammentPage />} />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/history" element={<HistoryIntro />} />
                        <Route path="/history/terminology" element={<HistoryTerminology />} />
                        <Route path="/history/format" element={<HistoryFormat />} />
                        <Route path="/history/limitations" element={<HistoryLimitations />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App