// // src/components/Sidebar.jsx

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Sparkles, LayoutDashboard, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';
// import logo from "../../public/logo.png";

// import { useAuth } from '../context/AuthContext';
// import { logout } from '../firebase';
// import './Sidebar.css';

// function Sidebar({ activeView, onNavigate }) {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/'); 
//     } catch (error) {
//       console.error("Failed to log out", error);
//       alert("Failed to log out. Please try again.");
//     }
//   };

//   if (!currentUser) {
//     return null;
//   }

//   // --- LOGIC MEIN BADLAAV ---
//   // User ka initial letter nikaal lein (e.g., test@gmail.com -> T)
//   // <-- CHANGED
//   const emailInitial = currentUser.email ? currentUser.email[0].toUpperCase() : '?';

//   return (
//     <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}> 
      
//       <button onClick={toggleSidebar} className="sidebar-toggle">
//         <ChevronLeft className="toggle-icon" />
//       </button>

//       {/* Logo */}
//       <div className="sidebar-logo">
//         <img className="logo-sideicon" src={logo}/>
//         <h3 className="logo-sidetext">Release Craft</h3> 
//       </div>

//       {/* Navigation Links */}
//       <nav className="sidebar-nav">
//         {/* ... aapke nav buttons ... */}
//         <button
//           onClick={() => onNavigate('dashboard')}
//           className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
//         >
//           <LayoutDashboard className="nav-icon" />
//           <span className="nav-text">Dashboard</span> 
//         </button>
//         <button
//           onClick={() => onNavigate('releases')}
//           className={`nav-button ${activeView === 'releases' ? 'active' : ''}`}
//         >
//           <FileText className="nav-icon" />
//           <span className="nav-text">My Releases</span> 
//         </button>
//       </nav>

//       {/* User Menu */}
//       <div className="user-menu">
//         <div className="user-email">
          
//           {/* --- JSX MEIN BADLAAV --- */}
//           {/* Ab hum ternary operator ka istemaal karenge */}
//           {/* <-- CHANGED */}
//           <p className="email-text">
//             {isCollapsed ? emailInitial : currentUser.email}
//           </p> 

//         </div>
//         <div className="user-menu-buttons">
//           <button 
//             onClick={() => onNavigate('settings')}
//             className={`user-menu-button ${activeView === 'settings' ? 'active' : ''}`}
//           >
//             <Settings className="user-menu-icon" />
//             <span className="nav-text">Settings</span> 
//           </button>
//           <button 
//             onClick={handleLogout}
//             className="user-menu-button logout"
//           >
//             <LogOut className="user-menu-icon" />
//             <span className="nav-text" >Log Out</span> 
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Sidebar;

// src/components/Sidebar.jsx

import React from 'react'; // <-- 1. 'useState' ko hata diya
import { useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';
import logo from "../../public/logo.png";

import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase';
import './Sidebar.css';

// --- 2. PROPS MEIN 'isCollapsed' AUR 'onToggle' ADD KIYA ---
function Sidebar({ activeView, onNavigate, isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // --- 3. INTERNAL STATE HATA DIYA ---
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const toggleSidebar = () => {
  //   setIsCollapsed(!isCollapsed);
  // };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); 
    } catch (error) {
      console.error("Failed to log out", error);
      alert("Failed to log out. Please try again.");
    }
  };

  if (!currentUser) {
    return null;
  }

  const emailInitial = currentUser.email ? currentUser.email[0].toUpperCase() : '?';

  return (
    // 'isCollapsed' ab prop se aa raha hai
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}> 
      
      {/* --- 4. 'onToggle' PROP KO BUTTON PE LAGAYA --- */}
      <button onClick={onToggle} className="sidebar-toggle">
        <ChevronLeft className="toggle-icon" />
      </button>

      {/* Logo */}
      <div className="sidebar-logo">
        <img className="logo-sideicon" src={logo}/>
        <h3 className="logo-sidetext">Release Craft</h3> 
      </div>

      {/* Navigation Links (No Change) */}
      <nav className="sidebar-nav">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard className="nav-icon" />
          <span className="nav-text">Dashboard</span> 
        </button>
        <button
          onClick={() => onNavigate('releases')}
          className={`nav-button ${activeView === 'releases' ? 'active' : ''}`}
        >
          <FileText className="nav-icon" />
          <span className="nav-text">My Releases</span> 
        </button>
      </nav>

      {/* User Menu (No Change) */}
      <div className="user-menu">
        <div className="user-email">
          <p className="email-text">
            {isCollapsed ? emailInitial : currentUser.email}
          </p> 
        </div>
        <div className="user-menu-buttons">
          <button 
            onClick={() => onNavigate('settings')}
            className={`user-menu-button ${activeView === 'settings' ? 'active' : ''}`}
          >
            <Settings className="nav-icon" />
            <span className="nav-text">Settings</span> 
          </button>
          <button 
            onClick={handleLogout}
            className="user-menu-button logout"
          >
            <LogOut className="nav-icon" />
            <span className="nav-text" >Log Out</span> 
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;