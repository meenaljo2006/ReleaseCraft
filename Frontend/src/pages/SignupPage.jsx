import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'; 
import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';

import './AuthPage.css'; // Nayi CSS file
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

// --- Hamare Firebase Functions ---
import { 
    signInWithGoogle, 
    signInWithGitHub, 
    signUpWithEmail, 
    signInWithEmail 
} from "../firebase.js";

function SignupPage() {
    const [isSignIn, setIsSignIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const navigate = useNavigate();

    // --- Signup Logic ---
    const handleEmailSignup = async (e) => {
        e.preventDefault();
        try {
            const user = await signUpWithEmail(email, password, name);
            if (user) {
                navigate("/dashboard");
            }
        } catch(error) {
            console.error(error);
            let message = "Failed to create account. Try again.";
            
            if (error.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            } else if (error.code === "auth/email-already-in-use") {
                message = "This email is already registered.";
            }

            // --- STEP 1: ALERT DIKHAYEIN ---
            alert(message);
            
            // --- STEP 2: FORM CLEAR KAREIN ---
            setName("");
            setEmail("");
            setPassword("");
        }
    };

    // --- Login Logic ---
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await signInWithEmail(email, password);
            if (user) {
                navigate("/dashboard");
            }
        } catch(error) {
            console.error(error);
            let message = "Failed to log in. Try again.";

            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                message = "Invalid email or password.";
            }
            
            // --- STEP 1: ALERT DIKHAYEIN ---
            alert(message);

            // --- STEP 2: FORM CLEAR KAREIN ---
            setEmail("");
            setPassword("");
        }
    };

    // --- Provider Logins ---
    const handleGoogleAuth = async (e) => {
        e.preventDefault();
        try {
            await signInWithGoogle();
            navigate("/dashboard");
        } catch (error) {
            // --- STEP 1: ALERT DIKHAYEIN ---
            alert("Failed to sign in with Google.");
        }
    };

    const handleGitHubAuth = async (e) => {
        e.preventDefault();
        try {
            await signInWithGitHub();
            navigate("/dashboard");
        } catch (error) {
            // --- STEP 1: ALERT DIKHAYEIN ---
            alert("Failed to sign in with GitHub.");
        }
    };

    return (
        <>
            {/* --- POPUP LOGIC HATA DIYA GAYA HAI --- */}

            <div className="auth-header">
                <button className="back-btn" onClick={()=> navigate("/")}><ArrowLeft/>Go Back to Home Page</button>
            </div>
            <motion.div 
                className="auth-page-wrapper"
                initial={{ scale: 0.8, y: 20, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className={`box ${isSignIn ? '' : 'right-panel-active'}`}>
                    
                    {/* --- Register Form --- */}
                    <div className="formBox RegisterBox">
                        <form onSubmit={handleEmailSignup}>
                            <h1>Create Account</h1>
                            <div className="social-container">
                                <button type="button" onClick={handleGoogleAuth} className="social"><FcGoogle size={24} /></button>
                                <button type="button" onClick={handleGitHubAuth} className="social"><FaGithub size={24} color="black" /></button>
                            </div>
                            <span>or use your email for registration</span>
                            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            
                            {/* --- ERROR <p> TAG HATA DIYA --- */}
                            
                            <motion.button whileTap={{ scale: 0.85 }} type="submit">Sign Up</motion.button>
                        </form>
                        <p className="toggleText">
                            Already have an account?{' '}
                            <span className="toggleLink" onClick={() => setIsSignIn(true)}>Login</span>
                        </p>
                    </div>
                    
                    {/* --- Login Form --- */}
                    <div className="formBox LoginBox">
                        <form onSubmit={handleEmailLogin}>
                            <h1>Sign In</h1>
                            <div className="social-container">
                                <button type="button" onClick={handleGoogleAuth} className="social"><FcGoogle size={24} /></button>
                                <button type="button" onClick={handleGitHubAuth} className="social"><FaGithub size={24} color="black" /></button>
                            </div>
                            <span>or use your email account</span>
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            
                            {/* --- ERROR <p> TAG HATA DIYA --- */}

                            <motion.button whileTap={{ scale: 0.85 }} type="submit">Sign In</motion.button>
                        </form>
                        <p className="toggleText">
                            Don't have an account?{' '}
                            <span className="toggleLink" onClick={() => setIsSignIn(false)}>Register</span>
                        </p>
                    </div>

                    {/* --- Overlay Panels --- */}
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>To keep connected with us, Please Login.</p>
                                <motion.button whileTap={{ scale: 0.85 }} className="ghost" onClick={() => setIsSignIn(true)}>Sign In</motion.button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p>Enter your details and start journey with us.</p>
                                <motion.button whileTap={{ scale: 0.85 }} className="ghost" onClick={() => setIsSignIn(false)}>Sign Up</motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default SignupPage;