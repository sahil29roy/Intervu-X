import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";

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
  Terminal: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
};

const DEFAULT_CODE = `// Demo Interview Workspace
// Welcome! This is a simulated live coding environment.

function helloIntervuX() {
    console.log("Welcome to the Demo Interview!");
    console.log("You can write and run JavaScript code here.");
}

helloIntervuX();
`;

export default function DemoInterview({ user, navigateToDashboard }) {
  const [editorCode, setEditorCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Time tracking for the mock interview
  const [elapsedTime, setElapsedTime] = useState(0);

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

  const handleRunCode = async () => {
    if (!editorCode.trim()) return;
    setIsRunning(true);
    setOutput("Executing...\n");
    
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
          inputCase: "" // No specific stdin for demo
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
                <img src={user.profilePicture || "https://i.pravatar.cc/150?img=11"} alt="You" className="user-video-img" />
              </div>
              <div className="video-footer">
                <span>{user.name} (You)</span>
              </div>
            </div>
          </div>

          <div className="demo-chat-panel">
            <div className="chat-header">Interview Chat & Notes</div>
            <div className="chat-messages">
              <div className="chat-msg system">Session started. Recording is off for demo.</div>
              <div className="chat-msg received"><strong>Jane:</strong> Hello {user.name}, let's start with a simple JavaScript exercise.</div>
            </div>
            <div className="chat-input-area">
              <input type="text" placeholder="Type a message..." disabled />
              <Button variant="outline" disabled>Send</Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor & Terminal */}
        <div className="demo-right-panel">
          <div className="editor-toolbar">
            <div className="lang-selector">
              <span className="lang-label">Language:</span>
              <select defaultValue="javascript">
                <option value="javascript">JavaScript (Node.js)</option>
              </select>
            </div>
            <Button variant="default" className="run-btn" onClick={handleRunCode} disabled={isRunning}>
              <Icon.Play /> {isRunning ? "Running..." : "Run Code"}
            </Button>
          </div>
          
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
    </div>
  );
}
