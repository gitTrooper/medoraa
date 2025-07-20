import React, { useState, useEffect } from "react";
import {
  Container, Card, Form, Button, Table, Row, Col,
  InputGroup, ListGroup, Alert, Spinner
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from "firebase/firestore";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "../styles/PrescriptionStyles.css";

const predefinedTests = [
  "Complete Blood Count (CBC)", "Blood Sugar (Fasting/PP)", "Liver Function Test",
  "Kidney Function Test", "Thyroid Profile", "X-Ray Chest", "ECG", "MRI Brain",
  "CT Scan Abdomen", "Urine Routine"
];

const medicineSuggestions = [
  "Paracetamol", "Ibuprofen", "Amoxicillin", "Ciprofloxacin", "Azithromycin",
  "Cetirizine", "Metformin", "Amlodipine", "Omeprazole"
];

const PrescriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;

  // State management
  const [patient, setPatient] = useState({});
  const [doctor, setDoctor] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medInput, setMedInput] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [pdfUrl, setPdfUrl] = useState("");
  const [storedFileKey, setStoredFileKey] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch patient and doctor data
  useEffect(() => {
    const fetchData = async () => {
      if (!appointment) {
        navigate("/doctor-dashboard");
        return;
      }

      try {
        setLoading(true);

        // Fetch patient data
        if (appointment.patientId) {
          const userSnap = await getDoc(doc(db, "users", appointment.patientId));
          if (userSnap.exists()) {
            setPatient(userSnap.data());
          }
        }

        // Fetch doctor data
        if (appointment.doctorId) {
          const docSnap = await getDoc(doc(db, "doctors", appointment.doctorId));
          if (docSnap.exists()) {
            setDoctor(docSnap.data());
          }
        }

        // Load existing prescription data if available
        if (appointment.prescription) {
          const prescriptionData = appointment.prescription;
          setMedicines(prescriptionData.medicines || []);
          setSelectedTests(prescriptionData.tests || []);
          setAdvice(prescriptionData.advice || "");
          setFollowUp(prescriptionData.followUp || "");
          setStoredFileKey(prescriptionData.fileKey || "");
          setPdfUrl(prescriptionData.accessUrl || "");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setAlertMessage("Error loading appointment data. Please try again.");
        setAlertType("danger");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointment, navigate]);

  // Filter medicine suggestions based on input
  const filteredSuggestions = medicineSuggestions.filter((med) =>
    med.toLowerCase().includes(medInput.toLowerCase())
  );

  // Handle test selection toggle
  const handleTestToggle = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  // Add medicine to the list
  const handleAddMedicine = () => {
    if (medInput.trim() && dosage.trim() && duration.trim()) {
      const newMedicine = {
        name: medInput.trim(),
        dosage: dosage.trim(),
        duration: duration.trim()
      };
      setMedicines(prev => [...prev, newMedicine]);
      setMedInput("");
      setDosage("");
      setDuration("");
      setShowSuggestions(false);
    } else {
      setAlertMessage("Please fill in all medicine fields (name, dosage, and duration).");
      setAlertType("warning");
    }
  };

  // Remove medicine from the list
  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  // Generate PDF from HTML content
  const generatePDFFromHTML = async () => {
    const prescriptionElement = document.querySelector('.prescription-paper');
    const inputElements = document.querySelectorAll('.no-print');

    if (!prescriptionElement) {
      throw new Error("Prescription element not found");
    }

    // Hide input elements for PDF generation
    inputElements.forEach(el => el.style.display = 'none');

    try {
      const canvas = await html2canvas(prescriptionElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false, // Disable logging
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    } finally {
      // Restore input elements visibility
      inputElements.forEach(el => el.style.display = '');
    }
  };

  // Upload PDF to Cloudflare using your specified API - FIXED with better error handling
  // Convert Blob to base64 (returns a data URI)
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // e.g., "data:application/pdf;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Upload to Cloudflare using JSON
const uploadToCloudflare = async (pdfBlob) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Get Firebase Auth Token
    const authToken = await user.getIdToken();
console.log('✅ Auth Token:', authToken);

    // Create a unique filename
    const fileName = `prescription_${Date.now()}.pdf`;

    // Convert blob to base64
    const base64Data = await blobToBase64(pdfBlob); // returns a data URI

    // Prepare JSON payload
    const payload = {
      fileName,
      fileType: "prescription",
      fileData: base64Data
    };

    console.log('Uploading to Cloudflare API with JSON...');
    console.log('Payload size:', base64Data.length, 'characters');
    console.log('File name:', fileName);

    // Upload to Cloudflare API
    const response = await fetch('https://r32usspts7.execute-api.eu-north-1.amazonaws.com/prod/cloudflareStorageApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error('Upload response error:', errorText);
      } catch (e) {
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      if (response.status === 500) {
        throw new Error(`Server error occurred. Please try again later. Details: ${errorText}`);
      } else if (response.status === 413) {
        throw new Error('File too large. Please try with a smaller prescription.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions.');
      } else {
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
    }

    let result;
    try {
      result = await response.json();
    } catch (e) {
      throw new Error('Invalid response from server. Please try again.');
    }

    if (!result.success) {
  throw new Error(result.message || "Upload failed - no success flag");
}

console.log('✅ Upload successful:', result);
console.log('✅ Uploaded File Key:', result.fileDetails?.fileKey); // <-- Add this

    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error("Cloudflare upload error:", error);
    throw error;
  }
};

// Fallback: Create a local blob URL for download
const createLocalDownloadUrl = (pdfBlob) => {
  const url = URL.createObjectURL(pdfBlob);
  return url;
};

  // Download prescription using your specified API - FIXED
  const downloadPrescription = async (fileKey) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Get Firebase Auth Token
      const authToken = await user.getIdToken();

      // Get fresh download URL using your specified API with proper Authorization header
      const response = await fetch(
        `https://cdzlnnqd41.execute-api.eu-north-1.amazonaws.com/prod/cloudflareFreshLink?fileKey=${encodeURIComponent(fileKey)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}` // Fixed: Proper Authorization header
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download response error:', errorText);
        throw new Error(`Download URL generation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Download failed');
      }

      // Open download URL in new tab
      window.open(result.data.accessUrl, '_blank');
      return result.data.accessUrl;

    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

// Save prescription to appointment document
const savePrescriptionToAppointment = async (fileDetails) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!appointment?.id) {
    throw new Error("Appointment ID not found");
  }

  const prescriptionData = {
    medicines: medicines || [],
    tests: selectedTests || [],
    advice: advice?.trim() || "",
    followUp: followUp?.trim() || "",
    fileKey: fileDetails.fileKey,
    fileName: fileDetails.fileName,
    originalName: fileDetails.originalName,
    fileSize: fileDetails.fileSize,
    accessUrl: fileDetails.accessUrl,
    uploadedAt: new Date(fileDetails.uploadedAt),
    prescriptionCreatedAt: new Date(),
    prescriptionCreatedBy: user.uid,
    doctorName: doctor?.name || "Doctor",
    isLocal: fileDetails.isLocal || false
  };

  try {
    // Update the appointment document with prescription data
    const appointmentRef = doc(db, 'appointments', appointment.id);
   await updateDoc(appointmentRef, {
  prescription: prescriptionData,
  hasPrescription: true,
  prescriptionGenerated: true, // ✅ Add this line
  prescriptionGeneratedAt: new Date()
});

    console.log(`Prescription saved to appointment: ${appointment.id}`);

    // Also update the mirror appointment in user's subcollection if it exists
    if (appointment.patientId) {
      try {
        const userAppointmentRef = doc(db, 'users', appointment.patientId, 'appointments', appointment.id);
        const userAppointmentDoc = await getDoc(userAppointmentRef);
        
        if (userAppointmentDoc.exists()) {
          await updateDoc(userAppointmentRef, {
            prescription: prescriptionData,
            hasPrescription: true,
            prescriptionGeneratedAt: new Date()
          });
          console.log(`Mirror prescription saved to user's appointment: ${appointment.patientId}/${appointment.id}`);
        }
      } catch (mirrorError) {
        console.warn("Could not update mirror appointment:", mirrorError);
        // Don't throw error as main appointment is updated
      }
    }

    // Save to local state
    setPdfUrl(fileDetails.accessUrl);
    setStoredFileKey(fileDetails.fileKey);

  } catch (error) {
    console.error("Database save error:", error);
    throw new Error("Failed to save prescription to appointment");
  }
};

  // Main save prescription function - Enhanced with fallback
  const handleSavePrescription = async () => {
    // Validation
    if (medicines.length === 0 && selectedTests.length === 0 && !advice.trim()) {
      setAlertMessage("Please add at least one medicine, test, or advice before saving.");
      setAlertType("warning");
      return;
    }

    setIsUploading(true);
    setAlertMessage("");

    try {
      // Generate PDF
      console.log('Generating PDF...');
      const pdfBlob = await generatePDFFromHTML();
      console.log('PDF generated successfully, size:', pdfBlob.size);

      let uploadResult = null;
      let fallbackUrl = null;

      try {
        // Try to upload to Cloudflare using your API
        console.log('Starting upload to Cloudflare...');
        uploadResult = await uploadToCloudflare(pdfBlob);
        console.log('Upload result:', uploadResult);

        // Save to appointment with fileKey
        console.log('Saving to appointment...');
        await savePrescriptionToAppointment(uploadResult.fileDetails);

        setAlertMessage("Prescription saved successfully to appointment!");
        setAlertType("success");

      } catch (uploadError) {
        console.error('Cloud upload failed, creating local fallback:', uploadError);

        // Create local fallback
        fallbackUrl = createLocalDownloadUrl(pdfBlob);

        // Save to appointment with fallback data
        const fallbackFileDetails = {
          fileKey: `local_${Date.now()}`,
          fileName: `prescription_${Date.now()}.pdf`,
          originalName: `prescription_${Date.now()}.pdf`,
          fileSize: pdfBlob.size,
          accessUrl: fallbackUrl,
          uploadedAt: new Date().toISOString(),
          isLocal: true
        };

        await savePrescriptionToAppointment(fallbackFileDetails);

        setAlertMessage(`Prescription saved to appointment with local storage! Cloud upload failed: ${uploadError.message}. You can still download and print the prescription.`);
        setAlertType("warning");
      }

      // Auto-hide message after 8 seconds
      setTimeout(() => setAlertMessage(""), 8000);

    } catch (error) {
      console.error('Save prescription error:', error);
      setAlertMessage(`Failed to save prescription: ${error.message}`);
      setAlertType("danger");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download button click - Enhanced with better fallback handling
  const handleDownloadPrescription = async () => {
    if (!storedFileKey && !pdfUrl) {
      setAlertMessage("No prescription saved yet. Please save prescription first.");
      setAlertType("warning");
      return;
    }

    try {
      if (storedFileKey && !storedFileKey.startsWith('local_')) {
        // Use the API to get fresh download link for cloud-stored files
        await downloadPrescription(storedFileKey);
      } else {
        // Direct download for local or fallback URLs
        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        } else {
          throw new Error('No download URL available');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      setAlertMessage(`Failed to download prescription: ${error.message}`);
      setAlertType("danger");

      // If API download fails, try direct URL as fallback
      if (pdfUrl) {
        try {
          window.open(pdfUrl, '_blank');
          setAlertMessage("Downloaded using fallback method.");
          setAlertType("info");
        } catch (fallbackError) {
          console.error('Fallback download also failed:', fallbackError);
        }
      }
    }
  };

  // Mark appointment as completed
  const handleMarkCompleted = async () => {
    if (!appointment?.id) {
      setAlertMessage("No appointment ID found.");
      setAlertType("warning");
      return;
    }

    try {
      const updateData = {
        status: "completed",
        completedAt: new Date()
      };

      // Update main appointment
      await updateDoc(doc(db, "appointments", appointment.id), updateData);

      // Update mirror appointment if exists
      if (appointment.patientId) {
        try {
          const userAppointmentRef = doc(db, 'users', appointment.patientId, 'appointments', appointment.id);
          const userAppointmentDoc = await getDoc(userAppointmentRef);
          
          if (userAppointmentDoc.exists()) {
            await updateDoc(userAppointmentRef, updateData);
          }
        } catch (mirrorError) {
          console.warn("Could not update mirror appointment status:", mirrorError);
        }
      }

      setAlertMessage("Appointment marked as completed successfully!");
      setAlertType("success");

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error marking appointment as completed:", error);
      setAlertMessage("Failed to mark appointment as completed.");
      setAlertType("danger");
    }
  };

  // Select medicine from suggestions
  const handleSelectSuggestion = (suggestion) => {
    setMedInput(suggestion);
    setShowSuggestions(false);
  };

  // Handle input focus for medicine suggestions
  const handleMedInputFocus = () => {
    if (medInput) {
      setShowSuggestions(true);
    }
  };

  // Close suggestions when clicking outside
  const handleMedInputBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle medicine input change
  const handleMedInputChange = (e) => {
    const value = e.target.value;
    setMedInput(value);
    setShowSuggestions(value.length > 0);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading appointment data...</p>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          No appointment data found. Please go back to the dashboard.
          <div className="mt-2">
            <Button variant="outline-primary" onClick={() => navigate("/doctor-dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {alertMessage && (
        <Alert
          variant={alertType}
          dismissible
          onClose={() => setAlertMessage("")}
          className="mb-3"
        >
          {alertMessage}
        </Alert>
      )}

      {pdfUrl && (
        <div className="text-center mb-3">
          <Alert variant="info">
            <strong>Prescription Saved to Appointment!</strong>
            <div className="mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadPrescription}
                className="me-2"
              >
                📄 Download Prescription
              </Button>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success"
              >
                📋 View Online
              </a>
            </div>
          </Alert>
        </div>
      )}

      {/* Show existing prescription indicator */}
      {appointment.prescription && (
        <Alert variant="success" className="mb-3">
          <strong>✅ Prescription exists for this appointment</strong>
          <div className="mt-1">
            <small>
              Created: {new Date(appointment.prescription.prescriptionCreatedAt?.toDate() || appointment.prescription.prescriptionCreatedAt).toLocaleString()}
            </small>
          </div>
        </Alert>
      )}
{/* Prescription Display */}
<div
  className="prescription-paper"
  style={{
    width: "210mm",
    height: "295mm",
    padding: "1mm",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    fontFamily: "'Times New Roman', serif",
    fontSize: "14px",
    color: "#000",
    margin: "0 auto",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative"
  }}
>
  {/* Header */}
  <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
    <div>
      <h4 className="text-success mb-1">{doctor.name || "Dr. Full Name"}</h4>
      <p className="mb-1"><strong>{doctor.specialization || "Specialist in [Field]"}</strong></p>
      <p className="mb-0">{doctor.clinic || "Health Care Medical Clinic"}</p>
      <p className="mb-0">📞 {doctor.phone || "Phone Number"}</p>
    </div>
    <div className="text-end">
      <h5 className="text-danger">Health Care Medical Clinic</h5>
    </div>
  </div>

  {/* Patient Info */}
  <div className="d-flex justify-content-between py-2 border-bottom">
    <div><strong>Name:</strong> {patient.name || appointment.patientName || "N/A"}</div>
    <div><strong>Age:</strong> {patient.age || "N/A"}</div>
    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
  </div>

  {/* Body */}
  <div style={{ display: "flex", flexGrow: 1, marginTop: "10px" }}>
    {/* Sidebar */}
    <div style={{
      width: "140px",
      backgroundColor: "#e8f5e9",
      padding: "10px",
      borderRight: "1px solid #ccc",
      lineHeight: "2"
    }}>
      <p><strong>C/C</strong></p>
      <p><strong>B/P</strong></p>
      <p><strong>Contrain</strong></p>
      <p><strong>X-Ray</strong></p>
      <p><strong>Advice</strong></p>
    </div>

    {/* Content */}
    <div style={{ flex: 1, padding: "15px", position: "relative" }}>
      <div style={{
        position: "absolute",
        top: "-10px",
        left: "5px",
        fontSize: "28px",
        color: "deeppink",
        fontWeight: "bold"
      }}>
        ℞
      </div>

      {/* Medicines */}
      {medicines.length > 0 && (
        <>
          <h6 className="mt-4 mb-2">Medicines</h6>
          <Table bordered size="sm">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med, i) => (
                <tr key={i}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Tests */}
      {selectedTests.length > 0 && (
        <>
          <h6 className="mt-4 mb-2">Recommended Tests</h6>
          <ul>
            {selectedTests.map((test, i) => (
              <li key={i}>{test}</li>
            ))}
          </ul>
        </>
      )}

      {/* Advice */}
      {advice && (
        <>
          <h6 className="mt-4 mb-2">Advice</h6>
          <p>{advice}</p>
        </>
      )}

      {/* Follow Up */}
      {followUp && (
        <>
          <h6 className="mt-4 mb-2">Follow-Up</h6>
          <p>{followUp}</p>
        </>
      )}
    </div>
  </div>

  {/* Footer */}
  <div style={{
    background: "linear-gradient(to right, #ff6f00, #d500f9)",
    color: "white",
    textAlign: "center",
    padding: "10px",
    fontSize: "13px",
    marginTop: "auto"
  }}>
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <div>Your Phone Number</div>
      <div>Your Clinic Location</div>
      <div>Your Website</div>
    </div>
  </div>
</div>


      {/* Input Forms - Hidden during print */}
      <div className="no-print">
        {/* Medicine Input */}
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Add Medicines</Card.Title>
            <Row>
              <Col md={4}>
                <div className="position-relative">
                  <Form.Control
                    value={medInput}
                    placeholder="Medicine name"
                    onChange={handleMedInputChange}
                    onFocus={handleMedInputFocus}
                    onBlur={handleMedInputBlur}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                      {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
                        <ListGroup.Item
                          key={i}
                          action
                          onClick={() => handleSelectSuggestion(suggestion)}
                          style={{ cursor: 'pointer' }}
                        >
                          {suggestion}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Dosage (e.g., 500mg twice daily)"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Duration (e.g., 7 days)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="success"
                  onClick={handleAddMedicine}
                  disabled={!medInput.trim() || !dosage.trim() || !duration.trim()}
                >
                  Add
                </Button>
              </Col>
            </Row>

            {/* Current Medicines List */}
            {medicines.length > 0 && (
              <div className="mt-3">
                <h6>Added Medicines:</h6>
                {medicines.map((med, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center border rounded p-2 mb-1">
                    <span>
                      <strong>{med.name}</strong> - {med.dosage} for {med.duration}
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Tests Selection */}
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Select Tests</Card.Title>
            <Row>
              {predefinedTests.map((test, i) => (
                <Col md={4} key={i} className="mb-2">
                  <Form.Check
                    label={test}
                    checked={selectedTests.includes(test)}
                    onChange={() => handleTestToggle(test)}
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* Advice and Follow-up */}
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Advice</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="Enter medical advice for the patient..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Follow Up</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Enter follow-up instructions..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button
            variant="primary"
            onClick={handleSavePrescription}
            className="me-3"
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Saving Prescription...
              </>
            ) : (
              "💾 Save Prescription"
            )}
          </Button>

          {pdfUrl && (
            <Button
              variant="info"
              onClick={handleDownloadPrescription}
              className="me-3"
              size="lg"
            >
              📥 Download PDF
            </Button>
          )}

          <Button
            variant="success"
            onClick={() => window.print()}
            className="me-3"
            size="lg"
          >
            🖨️ Print Prescription
          </Button>

          <Button
            variant="outline-primary"
            onClick={handleMarkCompleted}
            size="lg"
          >
            ✅ Mark as Completed
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default PrescriptionPage;