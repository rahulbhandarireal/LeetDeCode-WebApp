import { Routes, Route, useLocation } from 'react-router'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './components/Login'
import Friends from './pages/Friends'
import Battle from './pages/Battle'
import Sheets from './pages/Sheets'
import IDE from './pages/IDE'

function App() {
  const location = useLocation();
  const isIdePage = location.pathname.toLowerCase() === '/ide';

  return (
    <div>
      {!isIdePage && <Navbar />}
     <Routes>
      <Route path='/' element={<Login />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Friends" element={<Friends />} />
      <Route path="/Sheets" element={<Sheets />} />
      <Route path="/Battle" element={<Battle />} />
      <Route path="/ide" element={<IDE />} />
     </Routes>
    </div>
  )

  
}

export default App
