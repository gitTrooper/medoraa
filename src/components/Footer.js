// Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h5>Medoraa</h5>
            <ul>
              <li><Link to="/aboutus">About us</Link></li>
              <li><Link to="/terms-and-conditions">Terms And Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Services</h5>
            <ul>
              <li><Link to="/hospital-locator">Hospital Locator</Link></li>
              <li><Link to="/book-appointment">Appointment Booking</Link></li>
              <li><Link to="/chatbot">AI Chatbot</Link></li>
              <li><Link to="/report-analysis">Report Analysis</Link></li>
              <li><Link to="/diet-plan">Diet Plan Generator</Link></li>
            </ul>
          </div>

          
          <div className="footer-column">
            <h5>Social</h5>
            <ul>
              <li><a href="https://www.facebook.com/people/Medoraa-AI/pfbid02KDfNSWLo2gsBborcSUdBYspcizfKbAzq5LxCbhPoqtCnocDE5c87oK1inVmcpjDcl/?rdid=hHDZRWDTN2O5Cr2U&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F163WVdxJKy%2F" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.youtube.com/@medoraa01" target="_blank" rel="noopener noreferrer">Youtube</a></li>
              <li><a href="https://www.instagram.com/_medoraa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>

          {/* Logo section on the extreme right */}
          <div className="footer-column footer-logo-column">
            <div className="footer-logo-container">
              {/* Placeholder for logo - replace src with your logo file */}
              <img 
                src="" 
                alt="Medoraa Logo" 
                className="footer-logo-image"
                style={{ display: 'none' }} // Hide until you add the logo
              />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-brand">
            <div className="logo-section">
              <span className="footer-logo-icon">🩺</span>
              <span className="footer-logo-text">Medoraa</span>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
