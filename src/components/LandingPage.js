import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar"; // Import Navbar
import Footer from "./Footer"; 
import ReviewSection from "./ReviewSection";
import HealthCategories from "./HealthCategories";
import FaqSection from "./FaqSection";
import "../styles/LandingPage.css"; // Ensure correct CSS path

const LandingPage = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "We Ensure";

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let currentText = "";
    const fullText = "We Ensure";

    const type = () => {
      if (isDeleting) {
        currentText = fullText.substring(0, index--);
      } else {
        currentText = fullText.substring(0, index++);
      }

      setTypedText(currentText);

      if (!isDeleting && index === fullText.length + 1) {
        setTimeout(() => {
          isDeleting = true;
          index = fullText.length - 1;
        }, 2000); // pause before deleting
      } else if (isDeleting && index < 0) {
        isDeleting = false;
        index = 0;
      }
    };

    const interval = setInterval(type, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <NavigationBar /> {/* Use the NavigationBar component here */}

      <section className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              <div className="hero-content">
                <div className="headline">
                  <h1><span className="enhancing">{typedText}</span></h1>
                  <h1><span className="healthcare">The Well-Being</span></h1>
                  <h1><span className="access">of Your Health</span></h1>
                </div>
                <p className="mission-text">
                  Experience peace of mind with our dedicated commitment to ensuring your optimal well-being. 
                  Our comprehensive healthcare solutions provide 24/7 support, expert care, and personalized 
                  treatment plans tailored to your unique needs.
                </p>
                <div className="cta-buttons">
                  <button className="btn btn-dark contact-now">Contact Us</button>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="heart-illustration">
                <img src="/heart.png" alt="Healthcare Professional" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <HealthCategories/>
      
      
      <FaqSection />
      {/* Add the Footer component */}
      <Footer />
    </>
  );
};

export default LandingPage;
