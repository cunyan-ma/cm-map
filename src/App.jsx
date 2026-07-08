import { HashRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import MineralMap from './pages/MineralMap'
import AboutPage from './pages/AboutPage'
import Methodology from './pages/Methodology'
import Database from './pages/Database'

function App() {
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<MineralMap />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/database" element={<Database />} />
      </Routes>
    </HashRouter>
  )
}

export default App
