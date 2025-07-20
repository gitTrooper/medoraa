import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HospitalLocator.css';
import NavigationBar from "../components/NavigationBar";

const HospitalLocator = () => {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRange, setSelectedRange] = useState('');
  const [showRangeSelector, setShowRangeSelector] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user location when component mounts
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
      },
      (error) => {
        console.error('❌ Failed to get location:', error);
        alert('Unable to get your location. Please enable location access.');
      }
    );
  }, []);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const fetchHospitals = (location, radius) => {
    setLoading(true);
    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    // Use a larger radius for the API call to ensure we get enough results
    const apiRadius = Math.max(radius, 10000); // At least 10km for API call

    const request = {
      location,
      radius: apiRadius,
      type: 'hospital',
    };

    service.nearbySearch(request, (results, status) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Filter results based on actual distance
        const filteredHospitals = results.filter(hospital => {
          if (hospital.geometry && hospital.geometry.location) {
            const hospitalLat = hospital.geometry.location.lat();
            const hospitalLng = hospital.geometry.location.lng();
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              hospitalLat, 
              hospitalLng
            );
            
            // Add distance to hospital object for display
            hospital.distance = distance;
            
            // Return true if hospital is within selected radius
            return distance <= (radius / 1000); // Convert radius from meters to kilometers
          }
          return false;
        });

        // Sort by distance (closest first)
        filteredHospitals.sort((a, b) => a.distance - b.distance);
        
        setHospitals(filteredHospitals);
      } else {
        console.error('❌ No places found', { status });
        setHospitals([]);
      }
    });
  };

  const handleRangeSelection = () => {
    if (!selectedRange) {
      alert('Please select a range first');
      return;
    }
    
    if (!userLocation) {
      alert('Location not available. Please try again.');
      return;
    }

    setShowRangeSelector(false);
    fetchHospitals(userLocation, parseInt(selectedRange));
  };

  const handleViewMap = (placeId) => {
    navigate(`/hospital/${placeId}`);
  };

  const handleBackToRangeSelector = () => {
    setShowRangeSelector(true);
    setHospitals([]);
    setSelectedRange('');
  };

  if (showRangeSelector) {
    return (
       <>
      <NavigationBar />
      
      <div className="hospital-locator-container">
        <h2>Find Nearby Hospitals</h2>
        <div className="range-selector">
          <h3>Select Search Range:</h3>
          <div className="range-options">
            <label>
              <input
                type="radio"
                value="1000"
                checked={selectedRange === '1000'}
                onChange={(e) => setSelectedRange(e.target.value)}
              />
              1 km
            </label>
            <label>
              <input
                type="radio"
                value="3000"
                checked={selectedRange === '3000'}
                onChange={(e) => setSelectedRange(e.target.value)}
              />
              3 km
            </label>
            <label>
              <input
                type="radio"
                value="5000"
                checked={selectedRange === '5000'}
                onChange={(e) => setSelectedRange(e.target.value)}
              />
              5 km
            </label>
            <label>
              <input
                type="radio"
                value="10000"
                checked={selectedRange === '10000'}
                onChange={(e) => setSelectedRange(e.target.value)}
              />
              10 km
            </label>
          </div>
          <button 
            onClick={handleRangeSelection}
            disabled={!userLocation}
            className="search-btn"
          >
            {userLocation ? 'Search Hospitals' : 'Getting your location...'}
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
          <NavigationBar />
    <div className="hospital-locator-container">
      <div className="header-section">
        <h2>Nearby Hospitals ({selectedRange/1000} km range)</h2>
        <button onClick={handleBackToRangeSelector} className="back-btn">
          Change Range
        </button>
      </div>
      
      {loading ? (
        <p>Loading hospitals...</p>
      ) : (
        <div className="hospital-cards">
          {hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <div className="hospital-card" key={hospital.place_id}>
                <h3>{hospital.name}</h3>
                <p><strong>Address:</strong> {hospital.vicinity}</p>
                <p><strong>Rating:</strong> {hospital.rating || 'N/A'}</p>
                <button onClick={() => handleViewMap(hospital.place_id)}>
                  View on Map
                </button>
              </div>
            ))
          ) : (
            <p>No hospitals found in the selected range.</p>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default HospitalLocator;