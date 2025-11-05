// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase'; // Import auth from your firebase.js
import { onAuthStateChanged } from 'firebase/auth';

// 1. Create the context
const AuthContext = createContext();

// 2. Create a "hook" to make it easy to use
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component (the "manager")
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check if auth is ready

  useEffect(() => {
    // This is the most important part!
    // onAuthStateChanged is a built-in Firebase listener
    // that runs when a user logs in OR logs out.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        console.log("AuthContext: User is logged in", user.email);
      } else {
        console.log("AuthContext: User is logged out");
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // The 'value' is what all components will have access to
  const value = {
    currentUser,
    // We can add more here later, like the ID token
  };

  // We return the Provider, wrapping the whole app
  // We don't render the app until Firebase is done loading
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};