// src/components/NavigationBar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from '../contexts/AuthContext';
import "../styles/NavigationBar.css";

const NavigationBar = () => {
  const { currentUser, loadingAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
      if (mobileMenuOpen && !event.target.closest('.navbar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, mobileMenuOpen]);

  // Preload the logo image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(true);
    img.src = "/images/weblogo.png";
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Explicit logout from Navbar successful.");
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Handle protected route clicks
  const handleProtectedLinkClick = (e, path) => {
    e.preventDefault();
    handleLinkClick(); // Close mobile menu and dropdown
    
    if (!currentUser) {
      // Store the intended destination in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', path);
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // Show a basic loading state for the navigation bar
  if (loadingAuth) {
    return (
      <nav className="navbar navbar-expand-lg fixed-navbar">
        <div className="container-fluid">
          {/* Logo Section */}
          <Link
            className="navbar-brand"
            to="/"
          >
            <div className="logo-container">
              {logoLoaded ? (
                <img
                  src="/images/weblogo.png"
                  alt="Medoraa Logo"
                  className="logo-image"
                  onLoad={() => setLogoLoaded(true)}
                />
              ) : (
                <div className="logo-placeholder">
                  M
                </div>
              )}
            </div>
            <span className="logo-text">Medoraa</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg fixed-navbar">
      <div className="container-fluid">
        {/* Logo Section */}
        <Link 
          className="navbar-brand" 
          to="/" 
          onClick={handleLinkClick}
        >
          <div className="logo-container">
            {logoLoaded ? (
              <img
                src="/images/weblogo.png"
                alt="Medoraa Logo"
                className="logo-image"
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(true)}
              />
            ) : (
              <div className="logo-placeholder">
                M
              </div>
            )}
          </div>
          <span className="logo-text">Medoraa</span>
        </Link>
        
        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleMobileMenuToggle}
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Collapsible Content */}
        <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          {/* Navigation Links - Center */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/aboutus" onClick={handleLinkClick}>About Us</Link>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/chatbot" 
                onClick={(e) => handleProtectedLinkClick(e, '/chatbot')}
              >
                AI Chatbot
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/report-analysis" 
                onClick={(e) => handleProtectedLinkClick(e, '/report-analysis')}
              >
                Report Analysis
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/hospital-locator" 
                onClick={(e) => handleProtectedLinkClick(e, '/hospital-locator')}
              >
                Hospital Locator
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/services" 
                onClick={(e) => handleProtectedLinkClick(e, '/services')}
              >
                Diet Plan Generator
              </a>
            </li>
          </ul>

          {/* Buttons Section */}
          <div className="navbar-buttons">
            {!currentUser ? (
              <>
                <Link to="/login" className="get-started-btn" onClick={handleLinkClick}>
                  Get Started
                </Link>
                <Link to="/admin-login" className="sign-up-btn" onClick={handleLinkClick}>
                      Administrator
                </Link>

              </>
            ) : (
              <div className="user-dropdown">
                <button
                  className="user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                    alt="User"
                    className="user-icon"
                  />
                  <span className="user-name">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <ul className="dropdown-menu show">
                    <li>
                      <Link to="/profile" className="dropdown-item" onClick={handleLinkClick}>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;