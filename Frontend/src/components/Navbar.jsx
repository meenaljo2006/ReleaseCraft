// src/components/Navbar.js
import React from 'react';
import './Navbar.css'; // We will create this file next
import logo from "../../public/logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/"> <img src={logo}/>ReleaseCraft</a>
      </div>
      <div className="navbar-links">
        <button className="nav-button-secondary">Log In</button>
        <button className="nav-button-primary">Get Started Free</button>
      </div>
    </nav>
  );
};

export default Navbar;