
import { Routes,Route } from 'react-router'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'

function App() {

  return (
    <div>
      <Navbar />
     <Routes>
      <Route path="/home" element={<Home />} />
     </Routes>
    </div>
  )

  
}

export default App
