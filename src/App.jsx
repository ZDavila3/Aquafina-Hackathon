import { Routes, Route, Link } from 'react-router-dom'
import { Home } from './Pages/Home'
import { About } from './Pages/About'
import { Scan } from './Pages/Scan'
import './App.css'

export default function App() {
  return (
    <>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/scan">Scan</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/scan" element={<Scan />} />
      </Routes>
    </>
  )
}
