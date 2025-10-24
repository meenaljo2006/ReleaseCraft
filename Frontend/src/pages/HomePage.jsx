// src/pages/HomePage.js
import React from 'react';
import './HomePage.css'; // We will create this file next

const HomePage = () => {
  return (
    <div className="homepage-container">
      <header className="hero-section">
        <h1 className="hero-headline">
          Stop rewriting release notes. <br />
          Let AI do the first draft.
        </h1>
        <p className="hero-subheadline">
          ReleaseCraft connects to Jira, GitHub, and more. It translates
          technical tickets into beautiful, human-readable release notes in
          seconds.
        </p>
        <button className="hero-cta-button">
          Get Started - It's Free
        </button>
      </header>

      {/* You will add more sections here later:
        - Problem Section (Show the "before" - messy Jira tickets)
        - Solution Section (Show the "after" - clean AI notes)
        - Features Section
      */}
    </div>
  );
};

export default HomePage;