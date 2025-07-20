// Footer.js
import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-section">
              <span className="footer-logo-icon">🩺</span>
              <span className="footer-logo-text">Medicare</span>
            </div>
            <p className="footer-description">
              We provide all aspects of medical practice for your whole family, including
              general check-ups. We will work with you to develop individualized care
              plans, including diseases.
            </p>
            <div className="get-directions">
              <span>➔ Get Directions</span>
            </div>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h5>Company</h5>
              <ul>
                <li>About us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>News & Media</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>

            <div className="footer-column">
              <h5>Departments</h5>
              <ul>
                <li>General Medicine</li>
                <li>Cardiology</li>
                <li>Neurology</li>
                <li>Pediatrics</li>
                <li>Orthopedics</li>
                <li>Emergency care</li>
              </ul>
            </div>

            <div className="footer-column">
              <h5>Patient Services</h5>
              <ul>
                <li>Appointment Booking</li>
                <li>Health Check Packages</li>
                <li>Online Reports</li>
                <li>Insurance Support</li>
                <li>Patient Portal</li>
                <li>FAQs</li>
              </ul>
            </div>

            
          </div>
        </div>

        <div className="footer-bottom">
          <p>© Medicare International Hospital Ltd. 2025</p>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
