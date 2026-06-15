import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const Icon = {
  Video: () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  MicOff: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Play: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.6 5.6" />
    </svg>
  ),
  Terminal: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  FileText: () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Code: () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
};

const MOCK_CODING_QUESTION = {
  title: "Two Sum",
  description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input has exactly one solution.",
  sampleInput: "nums = [2,7,11,15]\ntarget = 9",
  sampleOutput: "[0,1]",
  starterCode: `// Mock Coding Question: Two Sum
function twoSum(nums, target) {
    // Write your code here
    
}

const inputLine = readLine();
if (inputLine) {
    const input = JSON.parse(inputLine);
    console.log(JSON.stringify(twoSum(input.nums, input.target)));
}`
};

const MOCK_MCQ_QUESTION = {
  question: "What is the output of `typeof null` in JavaScript?",
  options: [
    { id: "A", text: "\"undefined\"" },
    { id: "B", text: "\"object\"" },
    { id: "C", text: "\"null\"" },
    { id: "D", text: "\"number\"" }
  ],
  correctAnswer: "B"
};

export default function DemoInterview({ user, navigateToDashboard }) {
  const [activeSection, setActiveSection] = useState(null); // null | 'mcq' | 'coding'
  
  const [editorCode, setEditorCode] = useState(MOCK_CODING_QUESTION.starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqFeedback, setMcqFeedback] = useState(null);

  // Time tracking for the mock interview
  const [elapsedTime, setElapsedTime] = useState(0);

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, sender: "system", text: "Session started. Recording is off for demo." },
    { id: 2, sender: "Jane", text: `Hello ${user.name}, let's start with a simple JavaScript exercise or some conceptual questions.` }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "You", text: chatInput.trim() }]);
    setChatInput("");
  };

  const handleRunCode = async () => {
    if (!editorCode.trim()) return;
    setIsRunning(true);
    setOutput("Executing...\\n");
    
    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          language: "javascript",
          sourceCode: editorCode,
          inputCase: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }) // Fake stdin for the demo script
        })
      });

      const data = await res.json();
      if (res.ok) {
        let resultText = "";
        if (data.result.error) {
          resultText += `Error:\n${data.result.error}\n`;
        } else {
          resultText += `${data.result.output}\n`;
        }
        resultText += `\n[Execution completed in ${data.result.executionTimeMs}ms]`;
        setOutput(resultText);
      } else {
        setOutput(`Error: ${data.message || "Execution failed"}`);
      }
    } catch (err) {
      setOutput("Error: Failed to connect to execution server.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="demo-interview-layout">
      {/* Top Header */}
      <div className="demo-header">
        <div className="demo-header-left">
          <Button variant="outline" onClick={navigateToDashboard}>Exit Demo</Button>
          <div className="demo-title">
            <h2>Mock Technical Interview</h2>
            <span className="demo-badge">LIVE DEMO</span>
          </div>
        </div>
        <div className="demo-header-right">
          <div className="demo-timer">Time Elapsed: <span className="mono-time">{formatTime(elapsedTime)}</span></div>
          <Button variant="default" style={{ backgroundColor: "#EF4444", color: "white" }} onClick={navigateToDashboard}>End Session</Button>
        </div>
      </div>

      <div className="demo-main-area">
        {/* Left Panel: Video & Chat */}
        <div className="demo-left-panel">
          <div className="video-streams-container">
            {/* Interviewer Video Mock */}
            <div className="video-box interviewer-video">
              <div className="video-placeholder">
                <Icon.Video />
                <p style={{ marginTop: '8px' }}>Interviewer Feed (Simulated)</p>
              </div>
              <div className="video-footer">
                <span>Jane Doe (Interviewer)</span>
                <Icon.MicOff />
              </div>
            </div>

            {/* Candidate Video Mock */}
            <div className="video-box candidate-video">
              <div className="video-placeholder">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="You" className="user-video-img" />
                ) : (
                  <Avatar style={{ width: "64px", height: "64px", border: "2px solid #333" }}>
                    <AvatarFallback style={{ fontSize: "24px", backgroundColor: "#262626", color: "#ededed" }}>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="video-footer">
                <span>{user.name} (You)</span>
              </div>
            </div>
          </div>

          <div className="demo-chat-panel">
            <div className="chat-header">Interview Chat</div>
            <div className="chat-messages">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`chat-msg ${msg.sender === "system" ? "system" : "received"}`}
                  style={{
                    alignSelf: msg.sender === "You" ? "flex-end" : msg.sender === "system" ? "center" : "flex-start",
                    backgroundColor: msg.sender === "You" ? "#22C55E" : msg.sender === "system" ? "transparent" : "#1e1e1e",
                    color: msg.sender === "You" ? "#000" : "#E5E7EB",
                    border: msg.sender === "You" ? "none" : msg.sender === "system" ? "none" : "1px solid #262626"
                  }}
                >
                  {msg.sender !== "system" && <strong style={{ opacity: 0.8 }}>{msg.sender}: </strong>}
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <Button variant="outline" onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Content Area */}
        <div className="demo-right-panel" style={{ backgroundColor: activeSection === null ? "#121212" : "#0d0d0d" }}>
          
          {activeSection === null && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px", maxWidth: "500px" }}>
                <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>Select Interview Section</h2>
                <p style={{ color: "#9CA3AF", lineHeight: "1.6" }}>
                  Welcome to the Demo Interview workspace. Your interviewer has opened both a Conceptual MCQ section and a Live Coding section. Which would you like to start with?
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%", maxWidth: "800px" }}>
                <Card 
                  style={{ backgroundColor: "#1e1e1e", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", border: "1px solid #333" }}
                  onClick={() => setActiveSection("mcq")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D97706"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(217, 119, 6, 0.15)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon.FileText />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px" }}>MCQ Section</h3>
                      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Answer multiple-choice questions to test your theoretical knowledge.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  style={{ backgroundColor: "#1e1e1e", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", border: "1px solid #333" }}
                  onClick={() => setActiveSection("coding")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon.Code />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px" }}>Live Coding Section</h3>
                      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Solve algorithmic problems in a collaborative code editor.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "mcq" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid #262626" }}>
                <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>Conceptual Questions</h3>
                <Button variant="outline" onClick={() => setActiveSection(null)}>Back to Sections</Button>
              </div>

              <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: "18px", fontWeight: 500, lineHeight: "1.5" }}>
                    Q1. {MOCK_MCQ_QUESTION.question}
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {MOCK_MCQ_QUESTION.options.map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setSelectedMcqOption(opt.id)}
                      style={{ 
                        padding: "16px", 
                        backgroundColor: selectedMcqOption === opt.id ? "rgba(217, 119, 6, 0.15)" : "#262626", 
                        border: `1px solid ${selectedMcqOption === opt.id ? "#D97706" : "#333"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >
                      <div style={{ 
                        width: "24px", height: "24px", borderRadius: "50%", 
                        border: `2px solid ${selectedMcqOption === opt.id ? "#D97706" : "#555"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: selectedMcqOption === opt.id ? "#D97706" : "transparent"
                      }}>
                        {selectedMcqOption === opt.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#fff" }} />}
                      </div>
                      <span style={{ color: selectedMcqOption === opt.id ? "#fff" : "#EDEDED" }}>{opt.id}. {opt.text}</span>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                    {mcqFeedback && (
                      <span style={{ 
                        color: mcqFeedback === "correct" ? "#22C55E" : "#EF4444", 
                        fontWeight: 500,
                        fontSize: "14px"
                      }}>
                        {mcqFeedback === "correct" ? "Correct Answer! Great job." : "Incorrect Answer. Try again."}
                      </span>
                    )}
                    <Button 
                      onClick={() => {
                        setMcqFeedback(selectedMcqOption === MOCK_MCQ_QUESTION.correctAnswer ? "correct" : "incorrect");
                      }}
                      disabled={!selectedMcqOption}
                    >
                      Submit Answer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "coding" && (
            <>
              <div className="editor-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <Button variant="ghost" onClick={() => setActiveSection(null)} style={{ padding: "0 8px", color: "#9CA3AF" }}>
                    ← Back
                  </Button>
                  <div className="lang-selector">
                    <span className="lang-label">Language:</span>
                    <select defaultValue="javascript">
                      <option value="javascript">JavaScript (Node.js)</option>
                    </select>
                  </div>
                  <button
                    className="reset-editor-btn"
                    onClick={() => setEditorCode(MOCK_CODING_QUESTION.starterCode)}
                    title="Reset code to boilerplate"
                  >
                    <Icon.Refresh />
                  </button>
                </div>
                <Button variant="default" className="run-btn" onClick={handleRunCode} disabled={isRunning}>
                  <Icon.Play /> {isRunning ? "Running..." : "Run Code"}
                </Button>
              </div>
              
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Problem Description Panel */}
                <div style={{ width: "35%", minWidth: "300px", borderRight: "1px solid #262626", backgroundColor: "#121212", padding: "24px", overflowY: "auto" }}>
                  <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>{MOCK_CODING_QUESTION.title}</h3>
                  <div style={{ color: "#D1D5DB", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {MOCK_CODING_QUESTION.description}
                  </div>
                  
                  {MOCK_CODING_QUESTION.sampleInput && (
                    <div style={{ marginTop: "24px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Input:</h4>
                      <pre className="io-sample-block">{MOCK_CODING_QUESTION.sampleInput}</pre>
                    </div>
                  )}

                  {MOCK_CODING_QUESTION.sampleOutput && (
                    <div style={{ marginTop: "20px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Output:</h4>
                      <pre className="io-sample-block">{MOCK_CODING_QUESTION.sampleOutput}</pre>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div className="demo-editor-wrapper">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={editorCode}
                      onChange={(v) => setEditorCode(v)}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollbar: { vertical: "visible", horizontal: "visible" },
                        padding: { top: 16 }
                      }}
                    />
                  </div>

                  <div className="demo-terminal-wrapper">
                    <div className="terminal-header">
                      <Icon.Terminal /> Output
                    </div>
                    <div className="terminal-body">
                      <pre>{output}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
