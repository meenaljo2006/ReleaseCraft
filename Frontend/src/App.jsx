import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import your hook

// Import your pages
import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
import SignUpPage from "./pages/SignupPage";
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import ReleasesDashboard from './pages/ReleasesDashboard';
import ReleaseViewPage from './pages/ReleaseViewPage';
// Import your new layout
import MainLayout from './layouts/MainLayout'; 

// This is a special component to protect your dashboard
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/signup" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: Public pages with Navbar (using MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Route 3: Private (Protected) Route (without Navbar) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/project/:projectKey"
          element={<ProtectedRoute><ProjectPage /></ProtectedRoute>}
        />

        <Route
          path="/releases" 
          element={<ProtectedRoute><ReleasesDashboard /></ProtectedRoute>} // <-- NAYA ROUTE
        />

        {/* RELEASE DETAIL (ALAG PAGE) */}
        <Route
          path="/releases/:projectKey" // Release detail ke liye
          element={<ProtectedRoute><ReleaseViewPage /></ProtectedRoute>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;