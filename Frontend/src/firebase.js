import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import axios from 'axios';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();


// This function sends the new user to your Node.js backend
const syncUserWithBackend = async (user) => {
  try {
    // Get the token from Firebase
    const idToken = await user.getIdToken();
    console.log("Got ID Token, syncing with backend...");

    // Send the token to your backend's signup route
    await axios.post('http://localhost:3001/api/users/signup', {
      email: user.email,
      name: user.displayName || 'New User', 
      firebaseUid: user.uid
    }, {
      headers: {
        'Authorization': `Bearer ${idToken}` // Send token for future auth
      }
    });

    console.log("Backend sync successful.");
    return true;

  } catch (err) {
    // Check if the error is "User already exists"
    if (err.response && err.response.data && err.response.data.message.includes('User already exists')) {
      console.log("User already exists in our DB. Skipping sync.");
      return true; // It's not an error, just a returning user
    }
    // Log other errors
    console.error("Error syncing user with backend:", err.message);
    return false;
  }
};


const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    await syncUserWithBackend(res.user);
    return res.user;
  } catch (err) {
    console.error("Google sign-in error:", err.message);
    return null;
  }
};


const signInWithGitHub = async () => {
  try {
    const res = await signInWithPopup(auth, githubProvider);
    // GitHub often doesn't provide a public email, handle with care
    await syncUserWithBackend(res.user);
    return res.user;
  } catch (err) {
    console.error("GitHub sign-in error:", err.message);
    return null;
  }
};


const signInWithEmail = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (err) {
    console.error("Email sign-in error:", err.message);
    return null;
  }
};

const signUpWithEmail = async (email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    // A new user was created, we MUST sync them
    await syncUserWithBackend(res.user);
    return res.user;
  } catch (err) {
    console.error("Email sign-up error:", err.message);
    return null;
  }
};


const logout = () => {
  signOut(auth);
};


export {
  auth,
  signInWithGoogle,
  signInWithGitHub,
  signInWithEmail,
  signUpWithEmail,
  logout
};