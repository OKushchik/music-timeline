import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
// Local (offline) game
import SetupPage from './pages/SetupPage';
import LocalGamePage from './pages/LocalGamePage';
import LocalResultsPage from './pages/LocalResultsPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Existing online routes — unchanged */}
        <Route path="/"        element={<HomePage />} />
        <Route path="/auth"    element={<AuthPage />} />
        <Route path="/lobby"   element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/game/:roomCode" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/results/:roomCode" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />

        {/* Local (offline) game routes — no auth required */}
        <Route path="/setup"         element={<SetupPage />} />
        <Route path="/local-game"    element={<LocalGamePage />} />
        <Route path="/local-results" element={<LocalResultsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
