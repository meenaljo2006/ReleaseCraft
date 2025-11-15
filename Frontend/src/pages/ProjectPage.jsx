// src/pages/ProjectPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketsForUser, createReleaseFromFilters } from '../api'; 
import Sidebar from '../components/Sidebar';
import './Dashboard.css'; // Common styles
import './ProjectPage.css'; // Is page ki specific styles

function ProjectPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectKey } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: 'Done', 
    startDate: '2024-01-01', 
    endDate: '2025-12-31'
  });

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const response = await getTicketsForUser(
          projectKey,
          filters.status,
          filters.startDate,
          filters.endDate
        );
        setTickets(response.data);
      } catch (err) {
        console.error("Failed to load tickets", err);
        setTickets([]);
      }
      setIsLoading(false);
    };

    if (projectKey) {
      loadTickets();
    }
  }, [projectKey, filters]); 

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenerate = async () => {
    const title = prompt("Enter a title for your release:", "New Release");
    if (!title) return; 

    try {
      await createReleaseFromFilters({
        title: title,
        projectKey: projectKey,
        filters: filters 
      });
      alert("Release generation has started! You can check 'My Releases'.");
      navigate('/dashboard');
    } catch (err) {
      alert("Error starting generation.");
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView="" 
        onNavigate={(view) => navigate('/dashboard')} 
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
      />

      <div className="main-content">
        <div className="content-wrapper">
          <div className="welcome-header">
            <h1>Tickets for {projectKey}</h1>
            <button onClick={() => navigate('/dashboard')} className="back-button">
              &larr; Back to Dashboard
            </button>
          </div>
          
          <button 
            onClick={handleGenerate} 
            className="cta-button generate-button"
            disabled={isLoading || tickets.length === 0}
          >
            Generate Release
          </button>

          <div className="ticket-list-container">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Summary</th>
                  <th>Type</th>
                  <th className="status-filter-header">
                    <label>
                      Status:
                      <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="Done">Done</option>
                        <option value="In Progress">In Progress</option>
                        <option value="To Do">To Do</option>
                        <option value="">All</option>
                      </select>
                    </label>
                  </th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4"><p>Loading tickets...</p></td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan="4"><p>No tickets found for the selected filter.</p></td></tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>{ticket.fields.summary}</td>
                      <td>
                        <span className="ticket-issuetype">
                          <img src={ticket.fields.issuetype.iconUrl} alt="" width="16" />
                          {ticket.fields.issuetype.name}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="ticket-status"
                          style={{ 
                            backgroundColor: ticket.fields.status.statusCategory.colorName || '#ccc'
                          }}
                        >
                        {ticket.fields.status.name}
                      </span>
                      </td>
                      <td className="ticket-updated-date">
                        {formatDate(ticket.fields.updated)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;