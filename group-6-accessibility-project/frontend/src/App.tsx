import './App.css'
import { Routes, Route } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/games/:id" element={<GameDetailPage />} />
      </Routes>
    </>
  )
}

export default App
