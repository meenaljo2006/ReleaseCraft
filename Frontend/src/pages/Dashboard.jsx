  // src/pages/Dashboard.jsx
  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Link2, ChevronRight,Github  } from 'lucide-react';
  import { useAuth } from '../context/AuthContext';
  import Sidebar from '../components/Sidebar'; 
  import './Dashboard.css';
  import JiraIcon from '../assets/jiraIcon.png';
  import ProjectFlipCard from '../components/ProjectFlipCard';

  // 1. Import your new API service
  import { 
    getJiraProjects, 
    getJiraAuthUrl, 
    disconnectJira
  } from '../api';

  function Dashboard() {
    const [activeView, setActiveView] = useState('dashboard');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasJiraConnection, setHasJiraConnection] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

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
      if (view === 'dashboard') {
        navigate('/dashboard'); // Projects/Dashboard ka main route
      } 
      else if (view === 'releases') {
        navigate('/releases'); // <-- RELEASES PAGE KE NAYE ROUTE PAR BHEJEIN
      } 
      else if (view === 'settings') {
        setActiveView(view); // Settings ko abhi tab mein rehne dein
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
          <>
          <div className="welcome-header">
              <h1>Welcome {currentUser.displayName || currentUser.email}👋🏻</h1>
              <p>Start creating AI-powered release notes in minutes</p>
          </div>

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
                <Github/>
                <span>Connect GitHub</span>
                <ChevronRight className="chevron-icon" />
              </button>
              <button
                onClick={() => handleNavigate('connect-jira')}
                className="cta-button cta-button-jira"
              >
                <img src={JiraIcon} width={28}/>
                <span>Connect Jira</span>
                <ChevronRight className="chevron-icon" />
              </button>
            </div>
          </div>
          </>
        );
      }
      
      // Jab connection hai
      switch (activeView) {
        case 'dashboard':
          return (
            <div className='projectPage'>
              <h2>Your Projects</h2>
              <p className='pageDesc'>Select a project to see all its tickets.</p> {/* <-- CHANGED: Text update kiya */}
              <div className="project-list">
                {projects.map(project => (
                  // <-- CHANGED: Project card ko clickable banaya
                  <ProjectFlipCard 
                    key={project.key} 
                    project={project}
                    onClick={() => navigate(`/dashboard/project/${project.key}`)}
                  />
                ))}
              </div>
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
      <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
          activeView={activeView} 
          onNavigate={handleNavigate} 
          isCollapsed={isCollapsed}
          onToggle={toggleSidebar}
        />
        <div className="main-content">
          <div className="content-wrapper">
            
            
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  export default Dashboard;