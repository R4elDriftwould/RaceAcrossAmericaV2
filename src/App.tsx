import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RacesListPage from "./pages/RacesListPage";
import RaceManagerPage from "./pages/RaceManagerPage";
import RaceTrackerPage from "./pages/RaceTrackerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentsPage from "./pages/StudentsPage";
import TeamPage from "./pages/TeamPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Auth pages — no nav bar, no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app pages */}
          <Route path="/races" element={<ProtectedRoute><RacesListPage /></ProtectedRoute>} />
          <Route path="/race/:raceId" element={<ProtectedRoute><RaceManagerPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/tracker/:raceId" element={<ProtectedRoute><RaceTrackerPage /></ProtectedRoute>} />

          {/* Catch-all: redirect anything unknown to /races */}
          <Route path="*" element={<Navigate to="/races" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;