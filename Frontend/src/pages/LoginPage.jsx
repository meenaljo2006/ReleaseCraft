// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail } from '../firebase'; // Import your functions
import './AuthPages.css'; // We'll create this CSS file next

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await signInWithEmail(email, password);
      if (user) {
        navigate('/dashboard'); // Success! Go to dashboard
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        navigate('/dashboard'); // Success! Go to dashboard
      }
    } catch (err) {
      setError('Failed to log in with Google.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Log In</h2>
        <p>Welcome back to ReleaseCraft!</p>

        <button className="auth-provider-btn google" onClick={handleGoogleLogin}>
          Log In with Google
        </button>
        {/* Add GitHub button here later */}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn-primary">
            Log In
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;