import React, { useState, useRef, useEffect } from "react";
import NavigationBar from './NavigationBar';


const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your Medoraa AI Health Assistant. How can I help you with your health concerns today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const chatboxRef = useRef(null);
  const [medicalProfile, setMedicalProfile] = useState(true); // Mock profile loaded

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Format bot messages for better readability
  const formatBotMessage = (text) => {
    if (!text) return text;
    
    let formattedText = text
      .replace(/(\. )(?=[A-Z])/g, '.\n\n')
      .replace(/(\? )(?=[A-Z])/g, '?\n\n')
      .replace(/(Based on|According to)/g, '\n\n$1')
      .replace(/(Over-the-counter|The documents suggest|Since you are)/g, '\n\n$1')
      .replace(/(If your|It's important)/g, '\n\n$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return formattedText;
  };

  // Mock send message function
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const currentInput = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      sender: "user",
      text: currentInput,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Simulate API response
    setTimeout(() => {
      const botResponse = {
        sender: "bot",
        text: "Thank you for your question. Based on your medical profile and symptoms, I recommend the following:\n\nFirst, it's important to monitor your symptoms closely. If you're experiencing persistent discomfort, consider scheduling an appointment with your healthcare provider.\n\nIn the meantime, you can try some over-the-counter remedies and ensure you're staying well-hydrated. Remember to rest and avoid strenuous activities until you feel better.\n\nIf your symptoms worsen or you develop a fever, please seek immediate medical attention.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && userInput.trim() && !isLoading) {
      sendMessage();
    }
  };

  return (
     <>
    <NavigationBar />
    
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5.67V21.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={styles.headerText}>
              <div style={styles.headerTitle}>Medoraa AI Assistant</div>
              <div style={styles.headerSubtitle}>
                Your Personal Healthcare Companion
                {isLoadingProfile && <span> • Loading your profile...</span>}
                {!isLoadingProfile && medicalProfile && <span> • Profile loaded ✓</span>}
                {!isLoadingProfile && !medicalProfile && <span> • Complete your profile for personalized care</span>}
              </div>
            </div>
            <div style={styles.statusIndicator}>
              <div style={styles.statusDot}></div>
              <span>Online</span>
            </div>
          </div>
        </div>
        
        <div style={styles.chatbox} ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
              {msg.sender === "bot" && (
                <div style={styles.avatarContainer}>
                  <div style={styles.botAvatar}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              )}
              <div style={msg.sender === "user" ? styles.userMessageContent : styles.botMessageContent}>
                {msg.sender === "bot" ? (
                  <div style={styles.formattedMessage}>
                    {formatBotMessage(msg.text).split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} style={styles.messageParagraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  msg.text
                )}
                <div style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={styles.loadingMessage}>
              <div style={styles.avatarContainer}>
                <div style={styles.botAvatar}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div style={styles.typingIndicator}>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={styles.typingText}>AI is analyzing...</span>
              </div>
            </div>
          )}
        </div>
        
        <div style={styles.inputContainer}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              placeholder={isLoadingProfile ? "Loading your profile..." : "Describe your symptoms or ask a health question..."}
              disabled={isLoading || isLoadingProfile}
            />
            <button 
              onClick={sendMessage} 
              style={{
                ...styles.button,
                ...((!userInput.trim() || isLoading || isLoadingProfile) ? styles.buttonDisabled : {})
              }}
              disabled={!userInput.trim() || isLoading || isLoadingProfile}
              title="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={styles.disclaimer}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#00b894" strokeWidth="2"/>
            </svg>
            For informational purposes only. Consult healthcare professionals for medical advice.
          </div>
        </div>
      </div>
      
      {/* Floating background elements */}
      <div style={styles.floatingElement1}></div>
      <div style={styles.floatingElement2}></div>
      <div style={styles.floatingElement3}></div>
    </div>
     </>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e6f9f5 0%, #d2f2ec 25%, #f4f7f8 50%, #e6f9f5 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden"
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    height: "80vh",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 51, 46, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0, 184, 148, 0.1)",
    position: "relative",
    zIndex: 1
  },
  header: {
    background: "linear-gradient(135deg, #00332e 0%, #002720 50%, #00332e 100%)",
    color: "white",
    padding: "20px 24px",
    position: "relative",
    overflow: "hidden"
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    position: "relative",
    zIndex: 2
  },
  headerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "4px",
    letterSpacing: "-0.02em"
  },
  headerSubtitle: {
    fontSize: "13px",
    opacity: 0.85,
    fontWeight: "400",
    color: "#cfeee8"
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    background: "rgba(0, 184, 148, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(0, 184, 148, 0.3)"
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00c4a7",
    animation: "pulse 2s infinite"
  },
  chatbox: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    background: "linear-gradient(to bottom, rgba(244, 247, 248, 0.3) 0%, rgba(230, 249, 245, 0.2) 100%)",
    position: "relative"
  },
  userMessage: {
    display: "flex",
    justifyContent: "flex-end",
    marginLeft: "60px"
  },
  botMessage: {
    display: "flex",
    justifyContent: "flex-start",
    marginRight: "60px",
    alignItems: "flex-start",
    gap: "12px"
  },
  avatarContainer: {
    marginTop: "4px"
  },
  botAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00b894 0%, #00c4a7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    flexShrink: 0,
    boxShadow: "0 4px 16px rgba(0, 184, 148, 0.25)",
    border: "2px solid rgba(255, 255, 255, 0.2)"
  },
  userMessageContent: {
    background: "linear-gradient(135deg, #00b894 0%, #00c4a7 100%)",
    color: "white",
    padding: "16px 20px",
    borderRadius: "18px 18px 4px 18px",
    boxShadow: "0 4px 20px rgba(0, 184, 148, 0.25)",
    fontSize: "15px",
    lineHeight: "1.5",
    maxWidth: "100%",
    wordWrap: "break-word",
    fontWeight: "400",
    position: "relative"
  },
  botMessageContent: {
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1a1a1a",
    padding: "16px 20px",
    borderRadius: "18px 18px 18px 4px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    fontSize: "15px",
    lineHeight: "1.6",
    border: "1px solid rgba(0, 184, 148, 0.1)",
    maxWidth: "100%",
    wordWrap: "break-word",
    backdropFilter: "blur(10px)"
  },
  formattedMessage: {
    marginBottom: "8px"
  },
  messageParagraph: {
    margin: "0 0 12px 0",
    padding: 0,
    lineHeight: "1.6"
  },
  messageTime: {
    fontSize: "11px",
    color: "#8ba0a8",
    textAlign: "right",
    marginTop: "8px",
    fontWeight: "400"
  },
  loadingMessage: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "8px"
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "18px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    gap: "10px",
    border: "1px solid rgba(0, 184, 148, 0.1)",
    backdropFilter: "blur(10px)"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00b894",
    animation: "bounce 1.4s infinite ease-in-out both"
  },
  typingText: {
    color: "#8ba0a8",
    fontSize: "14px",
    fontStyle: "italic",
    marginLeft: "4px"
  },
  inputContainer: {
    padding: "20px 24px",
    borderTop: "1px solid rgba(0, 184, 148, 0.1)",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)"
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    background: "rgba(249, 250, 251, 0.8)",
    borderRadius: "16px",
    padding: "6px",
    border: "1px solid rgba(0, 184, 148, 0.1)",
    backdropFilter: "blur(10px)"
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "12px",
    border: "none",
    fontSize: "15px",
    outline: "none",
    background: "transparent",
    color: "#1a1a1a",
    fontFamily: "inherit"
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #00b894 0%, #00c4a7 100%)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(0, 184, 148, 0.25)"
  },
  buttonDisabled: {
    background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
    cursor: "not-allowed",
    opacity: 0.6,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
  },
  disclaimer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#8ba0a8",
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "400"
  },
  floatingElement1: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "rgba(0, 184, 148, 0.1)",
    top: "10%",
    left: "-5%",
    filter: "blur(40px)",
    animation: "float1 20s ease-in-out infinite"
  },
  floatingElement2: {
    position: "absolute",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(0, 51, 46, 0.08)",
    bottom: "20%",
    right: "-3%",
    filter: "blur(30px)",
    animation: "float2 15s ease-in-out infinite"
  },
  floatingElement3: {
    position: "absolute",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(0, 196, 167, 0.12)",
    top: "60%",
    left: "10%",
    filter: "blur(25px)",
    animation: "float3 18s ease-in-out infinite"
  }
};

// Add keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes float1 {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
    }
    33% { 
      transform: translateY(-30px) translateX(20px); 
    }
    66% { 
      transform: translateY(20px) translateX(-15px); 
    }
  }
  
  @keyframes float2 {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
    }
    50% { 
      transform: translateY(-40px) translateX(-25px); 
    }
  }
  
  @keyframes float3 {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
    }
    25% { 
      transform: translateY(15px) translateX(30px); 
    }
    75% { 
      transform: translateY(-25px) translateX(-20px); 
    }
  }
  
  /* Custom scrollbar */
  *::-webkit-scrollbar {
    width: 6px;
  }
  
  *::-webkit-scrollbar-track {
    background: rgba(0, 184, 148, 0.1);
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb {
    background: rgba(0, 184, 148, 0.3);
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 184, 148, 0.5);
  }

  /* Smooth hover effects */
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(0, 184, 148, 0.35) !important;
  }
  
  input:focus {
    outline: 2px solid rgba(0, 184, 148, 0.3);
    outline-offset: -2px;
  }
`;

document.head.appendChild(styleSheet);

export default Chatbot;