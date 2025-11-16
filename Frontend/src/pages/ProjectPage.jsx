import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketsForUser, createReleaseFromFilters } from '../api'; 
import Sidebar from '../components/Sidebar';
import GenerateReleaseModal from '../components/GenerateReleaseModal.jsx';
import './Dashboard.css'; // Common styles
import './ProjectPage.css'; // Is page ki specific styles

// Yeh array ko randomly shuffle karega (Fisher-Yates Algorithm)
const shuffleArray = (array) => {
  let currentIndex = array.length,  randomIndex;

  // Jab tak elements shuffle karne ke liye bache hain
  while (currentIndex !== 0) {
    // Ek bacha hua element chunein
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Aur usse current element ke saath swap karein
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function ProjectPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectKey } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: '', // Default 'All'
    startDate: '2024-01-01', 
    endDate: '2025-12-31'
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusMenuRef = useRef(null); 

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (view) => {
    if (view === 'dashboard') {
      navigate('/dashboard'); // Go to the main dashboard (projects list)
    } else if (view === 'releases') {
      navigate('/releases'); // Go to the Releases list page (new route)
    } else if (view === 'settings') {
      // Settings ko dashboard page par le jayenge, jahan settings tab visible ho
      navigate('/dashboard', { state: { initialView: 'settings' } }); 
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setIsStatusOpen(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusMenuRef]);

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
        
        const shuffledTickets = shuffleArray(response.data);
        setTickets(shuffledTickets);

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

  const handleStatusSelect = (newStatus) => {
    setFilters(prev => ({
      ...prev,
      status: newStatus
    }));
    setIsStatusOpen(false); 
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

  // --- CHANGE 1: Naya color helper function ---
  const getStatusColor = (statusName) => {
    const normalizedStatus = statusName.toLowerCase().replace(/\s+/g, '');

    switch (normalizedStatus) {
      case 'done':
        return '#16a34a'; // Green
      case 'inprogress':
        return '#f97316'; // Orange
      case 'todo':
        return '#3b82f6'; // Blue
      default:
        return '#6b7280'; // Gray
    }
  };
  // --- END OF CHANGE 1 ---

  return (
    <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView="" 
        onNavigate={handleNavigate} 
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
      />

      <div className="main-content">
        <div className="content-wrapper">
          <div className="project-header">
            <h1>Tickets for {projectKey}</h1>
            <p >See all tickets at a glance.</p>
          </div>
          
          <div className="ticket-list-container">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Summary</th>
                  <th>Type</th>
                  
                  <th className="status-filter-header" ref={statusMenuRef}>
                    <div 
                      className="status-dropdown-toggle" 
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                      <span>Status</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="#5e6c84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {isStatusOpen && (
                      <div className="status-dropdown-menu">
                        <button onClick={() => handleStatusSelect('')}>All</button>
                        <button onClick={() => handleStatusSelect('Done')}>Done</button>
                        <button onClick={() => handleStatusSelect('In Progress')}>In Progress</button>
                        <button onClick={() => handleStatusSelect('To Do')}>To Do</button>
                      </div>
                    )}
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
                        {/* --- CHANGE 2: Dono changes yahan apply kiye gaye hain --- */}
                        <span 
                          className="ticket-status"
                          style={{ 
                            backgroundColor: getStatusColor(ticket.fields.status.name)
                          }}
                        >
                          {ticket.fields.status.name.toLowerCase() === 'in progress'
                            ? 'Progress'
                            : ticket.fields.status.name}
                        </span>
                        {/* --- END OF CHANGE 2 --- */}
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
          
          <div className="generate-button-container">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="cta-button generate-button"
              disabled={isLoading || tickets.length === 0}
            >
              Generate Release
            </button>
          </div>
        </div>
      </div>
      <GenerateReleaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectKey={projectKey}
      />
    </div>
  );
}

export default ProjectPage;