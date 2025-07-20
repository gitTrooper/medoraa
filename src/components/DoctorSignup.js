import React, { useState } from "react";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification
} from "firebase/auth"; 
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import "../styles/DoctorSignup.css";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    followUpFees: "",
    generalCheckupFees: "",
    specialistFees: "",
    intro: "",
    qualification: "",
    consultationMode: [],
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Cloudflare R2 image upload function
  const uploadImageToCloudflare = async (file, userId) => {
    try {
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);

      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const key = `profiles/${userId}/${timestamp}.${fileExtension}`;

      const bucket = process.env.REACT_APP_R2_BUCKET_NAME;
      if (!bucket) throw new Error("Bucket name is missing from .env");

      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,
        },
      });

      const uploadCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
        ContentDisposition: "inline",
      });

      await s3Client.send(uploadCommand);

      return {
        url: `${process.env.REACT_APP_R2_PUBLIC_URL}/${key}`,
        path: key,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Image upload failed. Check CORS or credentials.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConsultationModeChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      const currentModes = prev.consultationMode || [];
      
      if (isChecked) {
        if (!currentModes.includes(value)) {
          return { ...prev, consultationMode: [...currentModes, value] };
        }
        return prev;
      } else {
        return { ...prev, consultationMode: currentModes.filter(mode => mode !== value) };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const sendToAdminForApproval = async (userData, profileImageMeta = null) => {
    try {
      const adminRequestData = {
        ...userData,
        status: "pending_admin_approval",
        submittedAt: new Date().toISOString(),
        adminApproved: false,
        adminReviewed: false,
        adminComments: "",
        rejectionReason: "",
        profileImage: profileImageMeta?.url || null,
        profileImageMeta: profileImageMeta,
        requestId: `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: null,
        userAgent: navigator.userAgent,
        submissionSource: "signup_form",
        consultationMode: userData.consultationMode
      };

      await setDoc(doc(db, 'tempDoctorSignups', adminRequestData.requestId), adminRequestData);
      return adminRequestData.requestId;
    } catch (error) {
      console.error('Error sending to admin:', error);
      throw new Error('Failed to submit for admin approval');
    }
  };

  const validateForm = () => {
    const {
      firstName, lastName, email, password, specialization,
      licenseNumber, experience, followUpFees, generalCheckupFees,
      specialistFees, qualification, consultationMode
    } = formData;

    if (
      !firstName || !lastName || !specialization || !licenseNumber || 
      !experience || !followUpFees || !generalCheckupFees || 
      !specialistFees || !qualification || !consultationMode
    ) {
      setError('All fields including fee details are required');
      return false;
    }

    if (!consultationMode || !Array.isArray(consultationMode) || consultationMode.length === 0) {
      setError("Please select at least one consultation mode (Online or Offline)");
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!selectedImage) {
      setError('Profile picture is required for doctor registration');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { email, password } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      let profileImageMeta = null;
      if (selectedImage) {
        try {
          profileImageMeta = await uploadImageToCloudflare(selectedImage, user.uid);
        } catch (uploadErr) {
          setError("Image upload failed. Please try again later.");
          setLoading(false);
          return;
        }
      }

      const userData = {
        ...formData,
        uid: user.uid,
        userType: "doctor",
        password: "***HIDDEN***",
        submittedAt: new Date().toISOString(),
        emailVerified: false,
        consultationMode: formData.consultationMode || []
      };

      const requestId = await sendToAdminForApproval(userData, profileImageMeta);

      setSuccess(`Your doctor registration request has been submitted for admin approval. 
Request ID: ${requestId}. 
You will receive an email notification once your request is reviewed.`);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        specialization: "",
        licenseNumber: "",
        experience: "",
        followUpFees: "",
        generalCheckupFees: "",
        specialistFees: "",
        intro: "",
        qualification: "",
        consultationMode: []
      });
      setSelectedImage(null);
      setImagePreview(null);

      localStorage.setItem(`signup_request_doctor`, requestId);

       navigate('/');

    } catch (error) {
      console.error('Doctor signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="signup-container">
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <h2>Doctor Registration</h2>
          <p className="signup-subtitle">
            Join our medical platform. All registrations require admin approval for quality assurance.
          </p>
        </div>

        {/* Form */}
        <div className="signup-form-container">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="First Name*"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Last Name*"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="form-row">
              <div className="form-group">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Create Password*"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="form-row">
              <div className="form-group">
                <Form.Control
                  type="text"
                  name="qualification"
                  placeholder="Qualification (e.g., MBBS, MD)*"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <Form.Control
                  type="text"
                  name="specialization"
                  placeholder="Specialization*"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* License & Experience */}
            <div className="form-row">
              <div className="form-group">
                <Form.Control
                  type="text"
                  name="licenseNumber"
                  placeholder="Medical License Number*"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <Form.Control
                  type="number"
                  name="experience"
                  placeholder="Years of Experience*"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Consultation Mode */}
            <div className="form-group">
              <Form.Label>Consultation Mode*</Form.Label>
              <div className="consultation-modes">
                {["Online", "Offline"].map((mode) => (
                  <div key={mode} className="consultation-mode-item">
                    <input
                      type="checkbox"
                      id={`mode-${mode}`}
                      value={mode}
                      checked={formData.consultationMode.includes(mode)}
                      onChange={handleConsultationModeChange}
                    />
                    <label htmlFor={`mode-${mode}`}>{mode}</label>
                  </div>
                ))}
              </div>
              <div className="selected-modes">
                Selected: {formData.consultationMode.join(", ") || "None"}
              </div>
            </div>

            {/* Fee Structure */}
            <div className="form-group">
              <Form.Label>Fee Structure (INR)*</Form.Label>
              <div className="fee-grid">
                <Form.Control
                  type="number"
                  name="generalCheckupFees"
                  placeholder="General Checkup*"
                  value={formData.generalCheckupFees}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  type="number"
                  name="specialistFees"
                  placeholder="Specialist Consultation*"
                  value={formData.specialistFees}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  type="number"
                  name="followUpFees"
                  placeholder="Follow-up Fees*"
                  value={formData.followUpFees}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Introduction */}
            <div className="form-group">
              <Form.Control
                as="textarea"
                rows={3}
                name="intro"
                placeholder="Brief professional introduction and expertise*"
                value={formData.intro}
                onChange={handleChange}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <Form.Label>Profile Picture*</Form.Label>
              <div className={`image-upload-area ${selectedImage ? 'has-image' : ''}`} onClick={() => document.getElementById('image-input').click()}>
                {!imagePreview ? (
                  <>
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Click to upload profile picture</div>
                    <small className="text-muted">Max size: 5MB | Format: JPG, PNG</small>
                  </>
                ) : (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Profile Preview" />
                    <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#059669' }}>
                      ✓ Image selected
                    </div>
                  </div>
                )}
              </div>
              <Form.Control
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Submitting for Approval..." : "Submit Registration"}
            </Button>
          </Form>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <p>
            Already have an account?{" "}
            <Link to="/login">Login here</Link>
          </p>
          <p>
            <Link to="/check-registration-status">Check Registration Status</Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default DoctorSignup;