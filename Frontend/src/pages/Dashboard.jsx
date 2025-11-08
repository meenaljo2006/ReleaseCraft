// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar'; 
import './Dashboard.css';

// 1. Import your new API service
import { 
  getJiraProjects, 
  getJiraAuthUrl, 
  disconnectJira // <-- CHANGED: Naya function import kiya
} from '../api';

function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasJiraConnection, setHasJiraConnection] = useState(false);

  // 4. Fetch projects when the component loads
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const response = await getJiraProjects();
        setProjects(response.data);
        setHasJiraConnection(true); 
        setIsLoading(false);
      } catch (err) {
        setHasJiraConnection(false);
        setError('Could not load projects. Please connect Jira.');
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]); // Re-run when user logs in

  // 5. "Connect Jira" function
  const handleConnectJira = async () => {
    try {
      const response = await getJiraAuthUrl();
      const { url } = response.data;
      window.location.href = url; 
    } catch (err) {
      alert("Error: Could not start Jira connection.");
    }
  };

  // <-- CHANGED: Naya "Disconnect" function add kiya
  const handleDisconnect = async () => {
    // User se confirm karein
    if (window.confirm("Are you sure you want to disconnect your Jira account?")) {
      try {
        await disconnectJira();
        setHasJiraConnection(false); // UI ko reset karein
        setProjects([]); // Project list clear karein
        alert("Jira disconnected successfully.");
        // Stay on settings page
      } catch (err) {
        alert("Failed to disconnect Jira.");
      }
    }
  };
  
  // 6. Sidebar navigation function
  const handleNavigate = (view) => {
    if (view === 'dashboard' || view === 'releases' || view === 'settings') {
      setActiveView(view);
    } 
    else if (view === 'connect-jira') {
      handleConnectJira();
    }
    else if (view === 'connect-github') {
      alert("GitHub coming soon!");
    }
    else {
      alert(`Navigating to: ${view}`);
    }
  };

  // 7. Main content render function
  const renderContent = () => {
    if (isLoading) {
      return <h2>Loading...</h2>;
    }

    // Jab connection nahi hai
    if (!hasJiraConnection) {
      return (
        // ... (Aapka 'empty-state-card' wala code yahan waisa hi rahega) ...
        // ... (Copy from your file) ...
        <div className="empty-state-card">
          <div className="empty-state-icon-wrapper">
            <Link2 className="empty-state-icon" />
          </div>
          <h2>Let's get started</h2>
          <p className="empty-state-subtitle">
            To generate your first AI release notes, you need to connect your project management tool.
          </p>
          <div className="cta-button-group">
            <button
              onClick={() => handleNavigate('connect-github')}
              className="cta-button cta-button-github"
            >
              <span>Connect GitHub</span>
              <ChevronRight className="chevron-icon" />
            </button>
            <button
              onClick={() => handleNavigate('connect-jira')}
              className="cta-button cta-button-jira"
            >
              <span>Connect Jira</span>
              <ChevronRight className="chevron-icon" />
            </button>
          </div>
          <p className="empty-state-footer">
            Or try our <button onClick={() => handleNavigate('demo')} className="demo-link">1-minute demo</button>
          </p>
        </div>
      );
    }
    
    // Jab connection hai
    switch (activeView) {
      case 'dashboard':
        return (
          <div>
            <h2>Your Projects</h2>
            <p>Select a project to see all its tickets.</p> {/* <-- CHANGED: Text update kiya */}
            <div className="project-list">
              {projects.map(project => (
                // <-- CHANGED: Project card ko clickable banaya
                <div 
                  key={project.key} 
                  className="project-card clickable" // Optional: clickable class
                  onClick={() => navigate(`/dashboard/project/${project.key}`)}
                >
                  <img src={project.avatarUrl} alt={project.name} />
                  <h4>{project.name} ({project.key})</h4>
                </div>
              ))}
            </div>
          </div>
        );
      case 'releases':
        return (
          <div>
            <h2>My Releases</h2>
            <p>Your saved release drafts will appear here.</p>
          </div>
        );
      case 'settings':
        // <-- CHANGED: Poora 'settings' case update kiya
        return (
          <div>
            <h2>Settings</h2>
            <h3>Manage Connections</h3>
            {hasJiraConnection ? (
              <div>
                <p>Your Jira account is connected.</p>
                <button onClick={handleDisconnect} className="cta-button cta-button-jira">
                  Disconnect Jira
                </button>
              </div>
            ) : (
              <div>
                <p>Jira account is not connected.</p>
                <button onClick={() => handleNavigate('connect-jira')} className="cta-button cta-button-jira">
                  Connect Jira
                </button>
              </div>
            )}
          </div>
        );
      default:
        return <h2>Welcome</h2>;
    }
  };

  if (!currentUser) {
    return null; 
  }

  return (
    // ... (Aapka main return JSX waisa hi rahega) ...
    // ... (Copy from your file) ...
    <div className="dashboard-container">
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
      />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="welcome-header">
            <h1>Welcome, {currentUser.displayName || currentUser.email}!</h1>
            <p>Start creating AI-powered release notes in minutes</p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;