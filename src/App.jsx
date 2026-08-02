import { Routes, Route, useLocation } from 'react-router'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Friends from './pages/Friends'
import Battle from './pages/Battle'
import Sheets from './pages/Sheets'
import IDE from './pages/IDE'
import ProtectedRoute from './components/ProtectedRoute'
import { ROUTES } from './constants/routes'

function App() {
  const location = useLocation();
  const isIdePage = location.pathname.toLowerCase() === ROUTES.IDE;

  return (
    <div>
      {!isIdePage && <Navbar />}
     <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.HOME} element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path={ROUTES.FRIENDS} element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path={ROUTES.SHEETS} element={<ProtectedRoute><Sheets /></ProtectedRoute>} />
      <Route path={ROUTES.BATTLE} element={<ProtectedRoute><Battle /></ProtectedRoute>} />
      <Route path={ROUTES.IDE} element={<IDE />} />
     </Routes>
    </div>
  )
}

export default App
