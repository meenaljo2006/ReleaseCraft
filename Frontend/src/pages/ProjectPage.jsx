// src/pages/ProjectPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketsForUser, createReleaseFromFilters } from '../api'; // <-- Dono API import karein
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

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
        setTickets([]); // Error hone par list khaali kar dein
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
  
  // Date format karne ke liye helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar ko navigate function pass karein */}
      <Sidebar activeView="" onNavigate={(view) => navigate('/dashboard')} />

      <div className="main-content">
        <div className="content-wrapper">
          <div className="welcome-header">
            <h1>Tickets for {projectKey}</h1>
            <button onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>
          </div>

          {/* --- FILTER UI --- */}
          <div className="filters-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <label>
              Status:
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="Done">Done</option>
                <option value="In Progress">In Progress</option>
                <option value="To Do">To Do</option>
                <option value="">All</option>
              </select>
            </label>
            {/* Aap yahan Date Pickers bhi add kar sakte hain */}
          </div>

          {/* --- GENERATE BUTTON --- */}
          <button 
            onClick={handleGenerate} 
            className="cta-button"
            disabled={isLoading || tickets.length === 0}
            style={{backgroundColor: '#0065ff', color: 'white', border: 'none'}}
          >
            Generate Release from ({tickets.length}) tickets
          </button>

          {/* --- 7. TICKET LIST (FIXED) --- */}
          <div className="ticket-list-container" style={{ marginTop: '20px' }}>
            {isLoading ? <p>Loading tickets...</p> : (
              
              // Pehle check karein ki tickets hain ya nahi
              tickets.length === 0 ? (
                <p>No tickets found for the selected filter.</p>
              ) : (
                // Ab loop karein
                tickets.map(ticket => (
                  <div key={ticket.id} className="project-card" style={{marginBottom: '1rem'}}>
                    
                    {/* --- YEH CODE MISSING THA --- */}
                    <h4>{ticket.fields.summary}</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ 
                        backgroundColor: ticket.fields.status.statusCategory.colorName || '#ccc',
                        padding: '2px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', textTransform: 'uppercase'
                      }}>
                        {ticket.fields.status.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                        <img src={ticket.fields.issuetype.iconUrl} alt="" width="16" />
                        {ticket.fields.issuetype.name}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                      Updated: {formatDate(ticket.fields.updated)}
                    </p>
                    {/* --- END OF MISSING CODE --- */}

                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;