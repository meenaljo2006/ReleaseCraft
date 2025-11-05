// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signUpWithEmail } from '../firebase';
import './AuthPages.css'; // We reuse the same CSS!

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await signUpWithEmail(email, password);
      if (user) {
        // Note: The `syncUserWithBackend` is already called
        // *inside* your signUpWithEmail function!
        navigate('/dashboard'); // Success! Go to dashboard
      } else {
        setError('Failed to create an account.');
      }
    } catch (err) {
      if (err.message.includes('email-already-in-use')) {
        setError('This email is already in use.');
      } else {
        setError('Failed to create an account.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        // `syncUserWithBackend` is called inside signInWithGoogle
        navigate('/dashboard'); // Success! Go to dashboard
      }
    } catch (err) {
      setError('Failed to sign up with Google.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p>Get started with ReleaseCraft today.</p>

        <button className="auth-provider-btn google" onClick={handleGoogleLogin}>
          Sign Up with Google
        </button>
        {/* Add GitHub button here later */}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleEmailSignup}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            Create Account
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;