// src/App.js
import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="App">
      <Navbar />
      <HomePage />
      {/* Later, you will add "React Router" here 
        to show different pages like /login, /dashboard, etc.
      */}
    </div>
  );
}

export default App;