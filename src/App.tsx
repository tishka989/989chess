import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CoachProvider } from './context/CoachContext'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { PlayPage } from './pages/PlayPage'
import { ReelsPage } from './pages/ReelsPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CoachProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="play" element={<PlayPage />} />
                <Route path="reels" element={<ReelsPage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CoachProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
