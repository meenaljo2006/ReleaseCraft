import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X,ChevronRight } from 'lucide-react';
import './Navbar.css'; // Import the CSS file
import logo from "../../public/logo.png"

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Workflow', href: '/workflow' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    // Unscrolled state
    animate: {
      y: 0,
      opacity: 1,
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      boxShadow: 'none',
    },
    // Scrolled state
    scrolled: {
      y: 0,
      opacity: 1,
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Hardcoded light theme
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.header
      className="header"
      variants={headerVariants}
      initial="initial"
      animate={isScrolled ? 'scrolled' : 'animate'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="container">
        <div className="header-content">
          <motion.div
            className="logo-area"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <a href="/" className="logo-link">
              <div className="logo-icon-wrapper">
                <img className="logo-icon" alt="logo" src={logo} />
              </div>
              <span className="logo-text">Release Craft</span>
            </a>
          </motion.div>

          <nav className="nav-desktop">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="nav-item-wrapper"
                onMouseEnter={() =>
                  item.hasDropdown && setActiveDropdown(item.name)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a href={item.href} className="nav-link">
                  <span>{item.name}</span>
                </a>
              </div>
            ))}
          </nav>

          <div className="auth-buttons">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="/support" className="auth-link get-started">
                <span>Support</span>
                <ChevronRight className="get-started-icon" />
              </a>
            </motion.div>
          </div>

          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="menu-icon" />
            ) : (
              <Menu className="menu-icon" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mobile-menu-container"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mobile-menu-content">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="mobile-auth-buttons">
                  <a
                    href="/login"
                    className="mobile-auth-link mobile-sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="mobile-auth-link mobile-get-started"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}