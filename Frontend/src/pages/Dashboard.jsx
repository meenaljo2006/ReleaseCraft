// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Go back to home page after logout
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Welcome to your Dashboard</h1>
      <p>You are logged in as: {currentUser.email}</p>
      <button onClick={handleLogout}>Log Out</button>
      
      <hr style={{ margin: '40px 0' }} />

      {/* THIS IS WHERE YOU WILL BUILD THE NEXT STEPS:
        1. Check for Jira Connection
        2. If not connected, show "Connect Jira" button
        3. If connected, call GET /api/jira/me/projects and show them
      */}
      <h2>Your Projects</h2>
      <p>(Coming soon...)</p>
    </div>
  );
};

export default Dashboard;