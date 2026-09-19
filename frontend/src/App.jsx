import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './Auth'
import Categories from './Categories'
import CategoryDashboard from './CategoryDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/dashboard/:category" element={<CategoryDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App