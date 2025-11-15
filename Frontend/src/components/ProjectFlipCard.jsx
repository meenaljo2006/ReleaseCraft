// src/components/ProjectFlipCard.jsx
import React, { useState } from 'react';
// Naye icons add kiye hain
import { 
  ArrowRight, Zap, Code2, 
  ListTodo, CheckSquare, Loader2 // <-- Naye/Updated Icons
} from 'lucide-react'; 
import './ProjectFlipCard.css'; // Hum is CSS file ko update karenge

// Default project data, agar koi prop pass na ho
const DEFAULT_PROJECT = {
  avatarUrl: "https://raw.githubusercontent.com/user-attachments/assets/c39a7a3e-633c-4131-8948-2e8f1b0a8e32/jira-logo-gradient.png",
  name: "ReleaseCraft",
  key: "RCFT",
  description: "Instantly turn your Jira tickets into polished, ready-to-publish release notes.",
  // Default stats add karein
  stats: { todo: 0, inProgress: 0, done: 0 } 
}

function ProjectFlipCard({ project = DEFAULT_PROJECT, onClick }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Project data ko default ke saath merge karein
  const finalProject = { ...DEFAULT_PROJECT, ...project };
  
  // Stats ab seedha 'project' prop se aa rahe hain
  // 'useEffect' ya 'isLoading' ki zaroorat nahi hai
  const stats = finalProject.stats || { todo: '?', inProgress: '?', done: '?' };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
  };

  return (
    <div
      className="card-perspective-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div 
        className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}
      >
        
        {/* --- FRONT SIDE (No Change) --- */}
        <div className="project-card-face project-card-front">
          <div className="card-bg-gradient" />
          <div className="project-icon-wrapper">
            <div className="icon-animation-container">
              <div className="animated-lines-container">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animated-line"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <img 
                src={finalProject.avatarUrl} 
                alt={`${finalProject.name} logo`} 
                className="project-icon" 
              />
            </div>
          </div>
          <div className="project-card-content">
            <div className="project-card-text">
              <h3>{finalProject.name}</h3>
              <p>{finalProject.key}</p>
            </div>
            <div className="project-card-cta-icon">
              <Zap size={18} />
            </div>
          </div>
        </div>

        {/* --- BACK SIDE (Yeh hissa update hoga) --- */}
        <div className="project-card-face project-card-back">
          <div className="card-bg-gradient" />

          {/* Back Content */}
          <div className="project-card-back-content">
            {/* Header (No Change) */}
            <div className="back-header">
              <div className="back-header-icon">
                <img 
                src={finalProject.avatarUrl} 
                alt={`${finalProject.name} logo`} className='logo'
              />
              </div>
              <h3>{finalProject.name}</h3>
            </div>
            
            {/* Description (No Change) */}
            <p className="back-description">
              {finalProject.description}
            </p>

            {/* --- 6. FEATURE LIST AB DYNAMIC HOGI --- */}
            <div className="back-feature-list">
              {/* Ab 'isLoadingStats' check karne ki zaroorat nahi */}
              <div className="feature-item">
                <div className="feature-icon-wrapper todo">
                  <ListTodo size={12} />
                </div>
                <span>{stats.todo} To Do</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper in-progress">
                  <Zap size={12} />
                </div>
                <span>{stats.inProgress} In Progress</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper done">
                  <CheckSquare size={12} />
                </div>
                <span>{stats.done} Done</span>
              </div>
            </div>
          </div>

          {/* Back Footer (No Change) */}
          <div className="project-card-back-footer">
            <span>View Project</span>
               <ArrowRight size={16} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default ProjectFlipCard;