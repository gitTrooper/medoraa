import React, { useEffect, useState } from 'react';
import '../styles/Healthcategory.css';
import { Container, Button } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const healthCategories = [
  {
    title: "Cardiology",
    image: "/images/cardiologist.png",
    specialization: "Cardiologist",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  },
  {
    title: "Neurology",
    image: "/images/neurologist.png",
    specialization: "Neurologist",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  },
  {
    title: "Radiology",
    image: "/images/radiology.jpeg",
    specialization: "Radiologist",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  },
  {
    title: "Pulmonary",
    image: "/images/pulmonary.png",
    specialization: "Pulmonologist",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  },
  {
    title: "Dermatology",
    image: "/images/dermatologist.jpeg",
    specialization: "Dermatologist",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  },
  {
    title: "Pediatrics",
    image: "/images/child.png",
    specialization: "Pediatrician",
    description: "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in."
  }
];

const HealthCategories = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'doctors'));
        const allDoctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDoctors(allDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  const handleConsultClick = (specialization) => {
    if (currentUser) {
      navigate(`/specialists/${encodeURIComponent(specialization)}`);
    } else {
      alert("Please log in to consult a doctor.");
      navigate("/login");
    }
  };

  const handleViewAllClick = () => {
    // Navigate to all specialties page or show more categories
    navigate("/all-specialties");
  };

  return (
    <div className="services-container">
      <Container>
        <p className="section-subheading">Our Services</p>
        <h2 className="section-heading">
          Find Our Different Services<br />
          For Your Whole Family
        </h2>
        
        <div className="services-grid">
          {healthCategories.map((item, index) => (
            <div 
              key={index} 
              className="health-card"
              onClick={() => handleConsultClick(item.specialization)}
            >
              <div className="health-card-icon">
                <img src={item.image} alt={item.title} />
              </div>
              
              <h3 className="health-card-title">{item.title}</h3>
              
              <p className="health-card-description">{item.description}</p>
              
              <div className="health-card-link">
                View Details
                <span className="arrow-icon">→</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            variant="outline-primary" 
            className="view-all-btn"
            onClick={handleViewAllClick}
          >
            View All Specialties
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default HealthCategories;