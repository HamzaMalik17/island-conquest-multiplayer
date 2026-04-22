import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import WaitingPage from './pages/WaitingPage';
import GameplayPage from './pages/GameplayPage';
import HistoryListPage from './pages/HistoryListPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Navbar'; 

// Wrapper for protected routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  return user ? children : <Navigate to="/login" />;
};

// Layout for pages that need Navbar
const MainLayout = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />; 

  return (
    <>
      <Navbar user={user} />
      <div style={{ paddingTop: '60px' }}> 
        {children}
      </div>
    </>
  );
};


const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading Application...</div>; 
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <WelcomePage />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignupPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
        <Route
          path="/newgame/waiting"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WaitingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/newgame/:gameId" element={<ProtectedRoute><MainLayout><GameplayPage /></MainLayout></ProtectedRoute>} /> {/* Dynamic route for game */}
        <Route path="/history" element={<ProtectedRoute><MainLayout><HistoryListPage /></MainLayout></ProtectedRoute>} />
        <Route path="/history/:gameId" element={<ProtectedRoute><MainLayout><HistoryDetailPage /></MainLayout></ProtectedRoute>} /> {/* Dynamic route for history detail */}
        <Route path="/update-profile" element={<ProtectedRoute><MainLayout><UpdateProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><MainLayout><LeaderboardPage /></MainLayout></ProtectedRoute>} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;