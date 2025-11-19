import './App.css'
import { Routes, Route } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'
import { BrowsePage } from './pages/BrowserPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/games/:id" element={<GameDetailPage />} />
         <Route path="/browserpage" element={<BrowsePage />} />

      </Routes>
    </>
  )
}

export default App
