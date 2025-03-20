import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HymnVol1 from './pages/HymnVol1'

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hymn-vol-1" element={<HymnVol1 />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App 