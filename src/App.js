// App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Page Components
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import DoctorLogin from "./components/DoctorLogin";

import DoctorSignup from "./components/DoctorSignup";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import AppointmentPage from "./components/Appointment";
import HospitalSelect from "./components/HospitalSelect";
import DoctorSelect from "./components/DoctorSelect";
import BookAppointment from "./components/BookAppointment";
import ReportAnalysis from "./components/ReportAnalysis";
import RazorPayment from "./components/PaymentGateway";
import DoctorDashboard from "./components/DoctorDashboard";
import Prescription from "./components/PrescriptionPage";
import SpecialistsPage from "./components/SpecialistsPage";
import ReceiptPage from "./components/ReceiptPage.js";
import UserMyProfilePage from "./components/UserMyProfilePage.js";
import AdminPanel from './components/AdminPanel'; // adjust path if needed
import AppointmentsPage from "./components/AppointmentsPage";
import HospitalDashboard from "./components/HospitalDashboard.js";
import BloodBank from "./components/BloodBank.js";
import HospitalLocator from "./components/HospitalLocator.js";
import HospitalDetails from "./components/HospitalDetails.js";
import DietPlanGenerator from "./components/DietPlanGenerator.js";
import PatientSignup from "./components/PatientSignup.js";
import HospitalSignup from "./components/HospitalSignup.js";
import OAuth2Callback from './components/OAuth2Callback';
import AboutUs from "./components/aboutus.js";
import TermsAndConditions from "./components/termsAndConditions.js";
import ContactUs from './components/ContactUs.js';
import PrivacyPolicy from "./components/privacyPolicy.js";


import "./App.css"; // Global styles

// Handles logout if logged-in user navigates to "/"
const AuthAndRouteHandler = () => {
  const { currentUser, loadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingAuth && currentUser && location.pathname === "/") {
      console.log("User detected logged in and navigated to landing page. Logging out...");
      signOut(auth)
        .then(() => {
          console.log("User successfully logged out on landing page navigation.");
        })
        .catch((error) => {
          console.error("Error logging out when returning to landing page:", error);
        });
    }
  }, [location.pathname, currentUser, loadingAuth, navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doctorlogin" element={<DoctorLogin />} />
      
      <Route path="/signup/patient" element={<PatientSignup />} />
      <Route path="/signup/doctor" element={<DoctorSignup />} />
      <Route path="/signup/hospital" element={<HospitalSignup />} />

      <Route path="/profile" element={<UserMyProfilePage />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Authenticated User Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/blood-bank" element={<BloodBank />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

      <Route path="/oauth2callback" element={<OAuth2Callback />} />

      <Route path="/hospital-locator" element={<HospitalLocator />} />
      <Route path="/hospital/:placeId" element={<HospitalDetails />} /> {/* ✅ Route */}

      <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
       <Route path="/prescription" element={<Prescription />} />

      {/* Features */}
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/report-analysis" element={<ReportAnalysis />} />
      <Route path="/diet-plan" element={<DietPlanGenerator />} />


      {/* Appointment Flow */}
      <Route path="/book-appointment" element={<AppointmentPage />} />
      <Route path="/choose-hospital/:city" element={<HospitalSelect />} />
      <Route path="/select-doctor/:city/:hospitalId" element={<DoctorSelect />} />
      <Route path="/book-appointment/:city/:hospitalId/:doctorId" element={<BookAppointment />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/receipt" element={<ReceiptPage />} />

      {/* Specialists Directory */}
      <Route path="/specialists/:specialization" element={<SpecialistsPage />} />

      {/* Payment */}
      <Route path="/payment" element={<RazorPayment />} />

      {/* Footer */}
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      

    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthAndRouteHandler />
      </AuthProvider>
    </Router>
  );
}

export default App;
