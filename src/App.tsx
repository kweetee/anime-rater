import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AnimeFormPage from './pages/AnimeFormPage'
import TierListPage from './pages/TierListPage'
import CalibrationPage from './pages/CalibrationPage'
import SettingsPage from './pages/SettingsPage'

// Все маршруты приложения. Layout рисует навигацию вокруг страниц.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/anime/new" element={<AnimeFormPage />} />
        <Route path="/anime/:id" element={<AnimeFormPage />} />
        <Route path="/tierlist" element={<TierListPage />} />
        <Route path="/calibration" element={<CalibrationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}