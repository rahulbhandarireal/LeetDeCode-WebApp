
import { Routes,Route } from 'react-router'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './components/Login'
import Friends from './pages/Friends'
import Battle from './pages/Battle'
import Sheets from './pages/Sheets'
import IDE from './pages/IDE'

function App() {

  return (
    <div>
      <Navbar />
     <Routes>
      <Route path='/' element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/Friends" element={<Friends />} />
      <Route path="/Sheets" element={<Sheets />} />
      <Route path="/Battle" element={<Battle />} />
      <Route path="/ide" element={<IDE />} />
     </Routes>
    </div>
  )

  
}

export default App
