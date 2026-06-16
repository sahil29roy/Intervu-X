import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { io } from "socket.io-client";

// Connect to the current host (handled by Vite proxy in dev)
const socket = io();
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// ── Icons ──
const Icon = {
  Video: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  VideoOff: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Mic: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  MicOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Play: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: "6px" }}><path d="M8 5v14l11-7z" /></svg>,
  Refresh: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.6 5.6" /></svg>,
  Terminal: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  ScreenShare: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  FileText: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Code: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  Activity: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
};

// ── Mock Data ──
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

// ════════════════════════════════════════════════════
// ══  MAIN COMPONENT
// ════════════════════════════════════════════════════
export default function DemoInterview({ user, navigateToDashboard }) {
  const isInterviewer = user?.role === "interviewer";

  // ── Phases ──
  // "join" -> check permissions, enter room ID
  // "waiting" -> waiting for peer, room-ready
  // "active" -> the interview is live
  const [phase, setPhase] = useState("join");
  const [roomId, setRoomId] = useState("");
  
  // Pre-join verification
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  // Room status
  const [peerOnline, setPeerOnline] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [peerDisconnected, setPeerDisconnected] = useState(false);

  // ── AV Controls (Interviewer only, Candidate forced ON) ──
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // ── Interview state ──
  const [activeSection, setActiveSection] = useState(null);
  const [editorCode, setEditorCode] = useState(MOCK_CODING_QUESTION.starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqFeedback, setMcqFeedback] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const isRemoteCodeUpdate = useRef(false);

  // ── Chat state ──
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // ── Activity feed (interviewer only) ──
  const [activityLog, setActivityLog] = useState([]);

  // ── WebRTC state ──
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenActive, setRemoteScreenActive] = useState(false);

  // ════════════════════════════════════
  // ══  SOCKET.IO LISTENERS
  // ════════════════════════════════════
  useEffect(() => {
    const onUserJoined = ({ role, userName }) => {
      setPeerOnline(true);
      setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `${userName} (${role}) joined the room.` }]);
    };

    const onParticipantStatus = (status) => {
      setPeerOnline(isInterviewer ? status.candidateOnline : status.interviewerOnline);
      if (status.participantCount === 2) {
        setRoomReady(true);
        setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: "Both participants connected. Room is ready!" }]);
      } else {
        setRoomReady(false);
      }
    };

    const onChatMessage = (msg) => setMessages(prev => [...prev, msg]);
    
    const onCodeUpdate = (code) => {
      isRemoteCodeUpdate.current = true;
      setEditorCode(code);
    };

    const onMcqUpdate = (optionId) => setSelectedMcqOption(optionId);

    const onCandidateActivity = (activity) => {
      setActivityLog(prev => [...prev, { id: Date.now(), text: activity, time: new Date().toLocaleTimeString() }]);
    };

    const onUserDisconnected = ({ role, userName }) => {
      setPeerDisconnected(true);
      setPeerOnline(false);
      setMessages(prev => [...prev, { id: Date.now(), sender: "system", text: `${userName || role} has disconnected.` }]);
    };

    // WebRTC signaling
    const onWebrtcOffer = async (offer) => {
      if (!peerConnection.current) createPeerConnection();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("webrtc-answer", { roomId: window.__demoRoomId, answer });
    };

    const onWebrtcAnswer = async (answer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const onIceCandidate = async (candidate) => {
      if (peerConnection.current) {
        try { await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { /* ignore */ }
      }
    };

    const onScreenShareStart = () => setRemoteScreenActive(true);
    const onScreenShareStop = () => {
      setRemoteScreenActive(false);
      if (screenShareRef.current) screenShareRef.current.srcObject = null;
    };

    socket.on("user-joined", onUserJoined);
    socket.on("participant-status", onParticipantStatus);
    socket.on("chat-message", onChatMessage);
    socket.on("code-update", onCodeUpdate);
    socket.on("mcq-update", onMcqUpdate);
    socket.on("candidate-activity", onCandidateActivity);
    socket.on("user-disconnected", onUserDisconnected);
    socket.on("webrtc-offer", onWebrtcOffer);
    socket.on("webrtc-answer", onWebrtcAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("screen-share-start", onScreenShareStart);
    socket.on("screen-share-stop", onScreenShareStop);

    return () => {
      socket.off("user-joined", onUserJoined);
      socket.off("participant-status", onParticipantStatus);
      socket.off("chat-message", onChatMessage);
      socket.off("code-update", onCodeUpdate);
      socket.off("mcq-update", onMcqUpdate);
      socket.off("candidate-activity", onCandidateActivity);
      socket.off("user-disconnected", onUserDisconnected);
      socket.off("webrtc-offer", onWebrtcOffer);
      socket.off("webrtc-answer", onWebrtcAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("screen-share-start", onScreenShareStart);
      socket.off("screen-share-stop", onScreenShareStop);
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ════════════════════════════════════
  // ══  WebRTC + Permissions
  // ════════════════════════════════════
  const checkPermissions = async () => {
    setPermissionError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      // Update local video preview (we use a timeout to ensure the ref is mounted)
      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 100);
      
      setPermissionsGranted(true);
    } catch (err) {
      console.error("Permissions denied:", err);
      setPermissionError("Camera and microphone access is required to join the interview.");
      setPermissionsGranted(false);
    }
  };

  const toggleMic = () => {
    if (!isInterviewer) return; // Candidate cannot toggle
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (!isInterviewer) return; // Candidate cannot toggle
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const videoRefCallback = useCallback(node => {
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, [permissionsGranted]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { roomId: window.__demoRoomId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (e.track.label && e.track.label.includes("screen")) {
        if (screenShareRef.current) screenShareRef.current.srcObject = stream;
      } else {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      }
    };

    peerConnection.current = pc;
    return pc;
  }, []);

  const initWebRTC = async () => {
    const pc = createPeerConnection();
    // Add local tracks (which were already acquired during checkPermissions)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    // Candidate initiates the call
    if (!isInterviewer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer", { roomId: window.__demoRoomId, offer });
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      socket.emit("screen-share-start", { roomId });

      const screenTrack = stream.getVideoTracks()[0];
      if (peerConnection.current) {
        peerConnection.current.addTrack(screenTrack, stream);
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("webrtc-offer", { roomId, offer });
      }

      screenTrack.onended = () => {
        setIsScreenSharing(false);
        socket.emit("screen-share-stop", { roomId });
        screenStreamRef.current = null;
      };
    } catch (err) {
      console.error("Screen share denied:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    socket.emit("screen-share-stop", { roomId });
  };

  // ════════════════════════════════════
  // ══  HANDLERS
  // ════════════════════════════════════
  const handleJoinRoom = () => {
    const cleanRoomId = roomId.trim();
    if (!cleanRoomId || !permissionsGranted) return;
    
    window.__demoRoomId = cleanRoomId;
    socket.emit("join-room", {
      roomId: cleanRoomId,
      role: isInterviewer ? "interviewer" : "candidate",
      userName: user?.name || (isInterviewer ? "Interviewer" : "Candidate")
    });
    setPhase("waiting");
    setMessages([{ id: 1, sender: "system", text: `You joined room "${cleanRoomId}".` }]);
  };

  const handleStartInterview = () => {
    setPhase("active");
    initWebRTC(); // Actually establish the P2P connection now
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { id: Date.now(), sender: user?.name || (isInterviewer ? "Interviewer" : "Candidate"), text: chatInput.trim() };
    setMessages(prev => [...prev, msg]);
    socket.emit("chat-message", { roomId, message: msg });
    setChatInput("");
  };

  const handleCodeChange = (val) => {
    if (isRemoteCodeUpdate.current) { isRemoteCodeUpdate.current = false; return; }
    setEditorCode(val);
    socket.emit("code-update", { roomId, code: val });
  };

  const handleMcqClick = (optId) => {
    if (isInterviewer) return;
    setSelectedMcqOption(optId);
    setMcqFeedback(null);
    socket.emit("mcq-update", { roomId, optionId: optId });
    socket.emit("candidate-activity", { roomId, activity: `Selected Option ${optId} for MCQ` });
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (!isInterviewer) {
      const label = section === "mcq" ? "Viewing MCQ Section" : section === "coding" ? "Writing Code" : "Viewing Section Selection";
      socket.emit("candidate-activity", { roomId, activity: label });
    }
  };

  const handleRunCode = async () => {
    if (!editorCode.trim() || isInterviewer) return;
    setIsRunning(true);
    setOutput("Executing...\n");
    socket.emit("candidate-activity", { roomId, activity: "Running code..." });

    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: "javascript", sourceCode: editorCode, inputCase: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }) })
      });
      const data = await res.json();
      if (res.ok) {
        let resultText = data.result.error ? `Error:\n${data.result.error}\n` : `${data.result.output}\n`;
        resultText += `\n[Execution completed in ${data.result.executionTimeMs}ms]`;
        setOutput(resultText);
        socket.emit("candidate-activity", { roomId, activity: `Code executed — ${data.result.error ? "Error" : "Success"}` });
      } else {
        setOutput(`Error: ${data.message || "Execution failed"}`);
      }
    } catch (err) {
      setOutput("Error: Failed to connect to execution server.");
    } finally {
      setIsRunning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, []);

  // ════════════════════════════════════════════════════
  // ══  RENDER: PHASE 1 — JOIN ROOM
  // ════════════════════════════════════════════════════
  if (phase === "join") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", padding: "24px" }}>
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", width: "100%", maxWidth: "480px" }}>
          <CardHeader style={{ textAlign: "center", paddingBottom: "8px" }}>
            <CardTitle style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px" }}>Join Interview Room</CardTitle>
            <p style={{ fontSize: "15px", color: "#9CA3AF" }}>
              Pre-join check: Verify your camera and microphone.
            </p>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "16px" }}>
            
            {/* Permission Check Area */}
            <div style={{ padding: "16px", backgroundColor: "#262626", borderRadius: "8px", border: "1px solid #333", textAlign: "center" }}>
              {!permissionsGranted ? (
                <>
                  <p style={{ color: "#D1D5DB", fontSize: "14px", marginBottom: "16px" }}>
                    Camera and microphone permissions are required to enter the room.
                  </p>
                  <Button onClick={checkPermissions} style={{ width: "100%" }}>
                    Allow Camera & Microphone
                  </Button>
                  {permissionError && <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "12px" }}>{permissionError}</p>}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "100%", height: "180px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#000", border: "1px solid #444" }}>
                    <video ref={videoRefCallback} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
                  </div>
                  <span style={{ color: "#22C55E", fontSize: "14px", fontWeight: "bold" }}>✓ Permissions Granted</span>
                </div>
              )}
            </div>

            {/* Room ID Input */}
            <div>
              <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "8px" }}>Room ID</label>
              <Input
                placeholder="e.g. 1234"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={!permissionsGranted}
                onKeyDown={(e) => { if (e.key === "Enter" && permissionsGranted) handleJoinRoom(); }}
                style={{ fontSize: "18px", padding: "12px 16px", letterSpacing: "2px", textAlign: "center", backgroundColor: "#1e1e1e", border: "1px solid #444", color: "#fff" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", backgroundColor: "#262626", borderRadius: "8px", border: "1px solid #333" }}>
              <Avatar style={{ width: "36px", height: "36px" }}>
                <AvatarFallback style={{ backgroundColor: isInterviewer ? "#D97706" : "#22C55E", color: "#000", fontSize: "14px" }}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <span style={{ fontWeight: 500, color: "#EDEDED" }}>{user?.name}</span>
                <Badge variant={isInterviewer ? "warning" : "teal"} style={{ marginLeft: "8px", fontSize: "10px" }}>
                  {isInterviewer ? "INTERVIEWER" : "CANDIDATE"}
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || !permissionsGranted}
              style={{ backgroundColor: "#D97706", color: "#171717", fontWeight: 600, fontSize: "16px", padding: "12px" }}
            >
              Join Room
            </Button>

            <Button variant="outline" onClick={navigateToDashboard} style={{ width: "100%" }}>
              ← Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ══  RENDER: PHASE 2 — WAITING
  // ════════════════════════════════════════════════════
  if (phase === "waiting") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", padding: "24px" }}>
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", width: "100%", maxWidth: "480px", textAlign: "center" }}>
          <CardHeader>
            <CardTitle style={{ fontSize: "24px", fontFamily: "'Space Grotesk', sans-serif" }}>Room: {roomId}</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "24px" }}>
            
            {/* Peer Status */}
            <div style={{ padding: "16px", backgroundColor: "#262626", borderRadius: "8px", width: "100%", border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#D1D5DB" }}>{isInterviewer ? "Candidate" : "Interviewer"} Status:</span>
                <Badge style={{ backgroundColor: peerOnline ? "#22C55E" : "#4B5563" }}>
                  {peerOnline ? "ONLINE" : "WAITING..."}
                </Badge>
              </div>
            </div>

            {roomReady ? (
              <div style={{ width: "100%" }}>
                <Button onClick={handleStartInterview} style={{ width: "100%", backgroundColor: "#22C55E", color: "#000", fontSize: "16px", padding: "24px 0", fontWeight: "bold" }}>
                  Start Interview Session
                </Button>
              </div>
            ) : (
              <>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#D97706", animation: "pulse 1.5s infinite" }} />
                <p style={{ color: "#9CA3AF", fontSize: "16px" }}>
                  Waiting for the {isInterviewer ? "candidate" : "interviewer"} to join...
                </p>
              </>
            )}

            <Button variant="outline" onClick={navigateToDashboard}>Cancel & Exit</Button>
          </CardContent>
        </Card>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.3); }
          }
        `}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ══  RENDER: PHASE 3 — ACTIVE SESSION
  // ════════════════════════════════════════════════════

  const ChatPanel = () => (
    <div className="demo-chat-panel" style={{ minHeight: "250px" }}>
      <div className="chat-header">Interview Chat — Room {roomId}</div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-msg ${msg.sender === "system" ? "system" : "received"}`}
            style={{
              alignSelf: msg.sender === user?.name ? "flex-end" : msg.sender === "system" ? "center" : "flex-start",
              backgroundColor: msg.sender === user?.name ? "#22C55E" : msg.sender === "system" ? "transparent" : "#1e1e1e",
              color: msg.sender === user?.name ? "#000" : "#E5E7EB",
              border: msg.sender === user?.name ? "none" : msg.sender === "system" ? "none" : "1px solid #262626"
            }}
          >
            {msg.sender !== "system" && <strong style={{ opacity: 0.8 }}>{msg.sender}: </strong>}
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
        />
        <Button variant="outline" onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );

  // AV Control Bar for local video
  const AVControls = () => (
    <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "20px", zIndex: 10 }}>
      <button 
        onClick={toggleMic} 
        disabled={!isInterviewer}
        title={isInterviewer ? "Toggle Microphone" : "Microphone must remain on"}
        style={{ 
          background: micEnabled ? "#374151" : "#EF4444", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: isInterviewer ? "pointer" : "not-allowed", opacity: isInterviewer ? 1 : 0.6 
        }}
      >
        {micEnabled ? <Icon.Mic /> : <Icon.MicOff />}
      </button>
      <button 
        onClick={toggleVideo} 
        disabled={!isInterviewer}
        title={isInterviewer ? "Toggle Camera" : "Camera must remain on"}
        style={{ 
          background: videoEnabled ? "#374151" : "#EF4444", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: isInterviewer ? "pointer" : "not-allowed", opacity: isInterviewer ? 1 : 0.6 
        }}
      >
        {videoEnabled ? <Icon.Video /> : <Icon.VideoOff />}
      </button>
    </div>
  );

  if (isInterviewer) {
    return (
      <div className="demo-interview-layout">
        <div className="demo-header">
          <div className="demo-header-left">
            <Button variant="outline" onClick={navigateToDashboard}>Exit</Button>
            <div className="demo-title">
              <h2>Interview Monitor</h2>
              <span className="demo-badge" style={{ backgroundColor: "#D97706" }}>ROOM {roomId}</span>
            </div>
          </div>
          <div className="demo-header-right">
            <div className="demo-timer">Time: <span className="mono-time">{formatTime(elapsedTime)}</span></div>
            {peerDisconnected && <Badge variant="destructive">Candidate Disconnected</Badge>}
            <Button variant="destructive" onClick={navigateToDashboard}>End Session</Button>
          </div>
        </div>

        <div className="demo-main-area">
          <div className="demo-left-panel">
            <div className="video-streams-container">
              {/* Candidate Camera */}
              <div className="video-box interviewer-video" style={{ position: "relative" }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="video-footer">
                  <span>Candidate Camera</span>
                </div>
              </div>
              {/* My Camera */}
              <div className="video-box candidate-video" style={{ position: "relative" }}>
                <video ref={videoRefCallback} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", opacity: videoEnabled ? 1 : 0 }} />
                {!videoEnabled && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1e1e1e" }}><Icon.VideoOff /></div>}
                <AVControls />
                <div className="video-footer">
                  <span>{user?.name} (You)</span>
                </div>
              </div>
            </div>
            <ChatPanel />
          </div>

          <div className="demo-right-panel" style={{ backgroundColor: "#0d0d0d", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #262626", padding: "24px", minHeight: "50%" }}>
              {remoteScreenActive ? (
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <video ref={screenShareRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px", border: "1px solid #333" }} />
                  <Badge style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "#EF4444" }}>SCREEN SHARE LIVE</Badge>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#6B7280" }}>
                  <Icon.ScreenShare />
                  <p style={{ marginTop: "12px", fontSize: "16px" }}>Candidate screen share will appear here</p>
                  <p style={{ fontSize: "13px", color: "#4B5563" }}>Waiting for candidate to share their screen...</p>
                </div>
              )}
            </div>

            <div style={{ flex: 0, minHeight: "200px", maxHeight: "45%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600, borderBottom: "1px solid #262626", backgroundColor: "#171717", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon.Activity /> Candidate Activity
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                {activityLog.length === 0 ? (
                  <p style={{ color: "#6B7280", fontSize: "13px", fontStyle: "italic" }}>No activity yet. Updates will appear here.</p>
                ) : (
                  activityLog.map(a => (
                    <div key={a.id} style={{ display: "flex", gap: "12px", alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid #1e1e1e", fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", fontSize: "11px", whiteSpace: "nowrap" }}>{a.time}</span>
                      <span style={{ color: "#D1D5DB" }}>{a.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  // ══  CANDIDATE WORKSPACE
  // ══════════════════════════════════
  return (
    <div className="demo-interview-layout">
      <div className="demo-header">
        <div className="demo-header-left">
          <Button variant="outline" onClick={navigateToDashboard}>Exit</Button>
          <div className="demo-title">
            <h2>Interview Session</h2>
            <span className="demo-badge" style={{ backgroundColor: "#22C55E" }}>ROOM {roomId}</span>
          </div>
        </div>
        <div className="demo-header-right">
          <div className="demo-timer">Time: <span className="mono-time">{formatTime(elapsedTime)}</span></div>
          {peerDisconnected && <Badge variant="destructive">Interviewer Disconnected</Badge>}

          <Button
            variant="outline"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            style={{ borderColor: isScreenSharing ? "#EF4444" : "#D97706", color: isScreenSharing ? "#EF4444" : "#D97706" }}
          >
            <Icon.ScreenShare /> {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </Button>

          {!isSubmitted ? (
            <Button variant="default" style={{ backgroundColor: "#D97706", color: "#171717" }} onClick={() => {
              setIsSubmitted(true);
              socket.emit("candidate-activity", { roomId, activity: "Submitted all answers" });
            }}>
              Submit All
            </Button>
          ) : (
            <Button variant="destructive" onClick={navigateToDashboard}>End Session</Button>
          )}
        </div>
      </div>

      <div className="demo-main-area">
        <div className="demo-left-panel">
          <div className="video-streams-container">
            {/* Interviewer Camera */}
            <div className="video-box interviewer-video" style={{ position: "relative" }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="video-footer"><span>Interviewer</span></div>
            </div>
            {/* My Camera */}
            <div className="video-box candidate-video" style={{ position: "relative" }}>
              <video ref={videoRefCallback} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
              <AVControls />
              <div className="video-footer"><span>{user?.name} (You)</span></div>
            </div>
          </div>
          <ChatPanel />
        </div>

        <div className="demo-right-panel" style={{ backgroundColor: activeSection === null ? "#121212" : "#0d0d0d" }}>
          {isSubmitted ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "32px", fontFamily: "'Space Grotesk', sans-serif", color: "#22C55E" }}>Interview Completed!</h2>
                <p style={{ color: "#9CA3AF", marginTop: "12px" }}>Your answers have been submitted.</p>
              </div>
              <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", width: "100%", maxWidth: "500px" }}>
                <CardHeader><CardTitle style={{ fontSize: "20px" }}>Performance Summary</CardTitle></CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid #333" }}>
                    <div><h4 style={{ color: "#EDEDED" }}>MCQ</h4></div>
                    <span style={{ color: selectedMcqOption === MOCK_MCQ_QUESTION.correctAnswer ? "#22C55E" : "#EF4444", fontWeight: "bold" }}>
                      {selectedMcqOption === MOCK_MCQ_QUESTION.correctAnswer ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><h4 style={{ color: "#EDEDED" }}>Coding</h4></div>
                    <span style={{ color: output?.includes(MOCK_CODING_QUESTION.sampleOutput) ? "#22C55E" : "#EF4444", fontWeight: "bold" }}>
                      {output?.includes(MOCK_CODING_QUESTION.sampleOutput) ? "Pass" : "Fail"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeSection === null ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px", maxWidth: "500px" }}>
                <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>Choose a Section</h2>
                <p style={{ color: "#9CA3AF" }}>Select a section below to begin. Your interviewer can see your progress in real-time.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%", maxWidth: "700px" }}>
                <Card
                  style={{ backgroundColor: "#1e1e1e", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", border: "1px solid #333" }}
                  onClick={() => handleSectionChange("mcq")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D97706"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(217,119,6,0.15)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon.FileText />
                    </div>
                    <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>MCQ Section</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Answer conceptual questions</p>
                  </CardContent>
                </Card>
                <Card
                  style={{ backgroundColor: "#1e1e1e", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", border: "1px solid #333" }}
                  onClick={() => handleSectionChange("coding")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon.Code />
                    </div>
                    <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>Live Coding</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Solve algorithmic problems</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeSection === "mcq" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid #262626" }}>
                <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>Conceptual Questions</h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Button variant="outline" onClick={() => handleSectionChange(null)}>Back</Button>
                  <Button variant="default" onClick={() => handleSectionChange("coding")} style={{ backgroundColor: "#D97706", color: "#171717" }}>Go to Coding →</Button>
                </div>
              </div>
              <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: "18px", fontWeight: 500, lineHeight: "1.5" }}>Q1. {MOCK_MCQ_QUESTION.question}</CardTitle>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {MOCK_MCQ_QUESTION.options.map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => handleMcqClick(opt.id)}
                      style={{
                        padding: "16px",
                        backgroundColor: selectedMcqOption === opt.id ? "rgba(217,119,6,0.15)" : "#262626",
                        border: selectedMcqOption === opt.id ? "1px solid #D97706" : "1px solid #333",
                        borderRadius: "8px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: selectedMcqOption === opt.id ? "5px solid #D97706" : "2px solid #52525B" }} />
                      <span>{opt.text}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                    {mcqFeedback === "submitted" && <span style={{ color: "#22C55E", fontWeight: 500, fontSize: "14px" }}>Answer recorded!</span>}
                    <Button onClick={() => setMcqFeedback("submitted")} disabled={!selectedMcqOption || mcqFeedback === "submitted"}>
                      {mcqFeedback === "submitted" ? "Submitted" : "Submit Answer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeSection === "coding" ? (
            <>
              <div className="editor-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <Button variant="ghost" onClick={() => handleSectionChange(null)} style={{ padding: "0 8px", color: "#9CA3AF" }}>← Back</Button>
                  <div className="lang-selector">
                    <span className="lang-label">Language:</span>
                    <select defaultValue="javascript"><option value="javascript">JavaScript (Node.js)</option></select>
                  </div>
                  <button className="reset-editor-btn" onClick={() => { const s = MOCK_CODING_QUESTION.starterCode; setEditorCode(s); socket.emit("code-update", { roomId, code: s }); }} title="Reset code">
                    <Icon.Refresh />
                  </button>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Button variant="outline" onClick={() => handleSectionChange("mcq")} style={{ color: "#D97706", borderColor: "#D97706" }}>Go to MCQ →</Button>
                  <Button variant="default" className="run-btn" onClick={handleRunCode} disabled={isRunning}>
                    <Icon.Play /> {isRunning ? "Running..." : "Run Code"}
                  </Button>
                </div>
              </div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <div style={{ width: "35%", minWidth: "300px", borderRight: "1px solid #262626", backgroundColor: "#121212", padding: "24px", overflowY: "auto" }}>
                  <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>{MOCK_CODING_QUESTION.title}</h3>
                  <div style={{ color: "#D1D5DB", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{MOCK_CODING_QUESTION.description}</div>
                  {MOCK_CODING_QUESTION.sampleInput && <div style={{ marginTop: "24px" }}><h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Input:</h4><pre className="io-sample-block">{MOCK_CODING_QUESTION.sampleInput}</pre></div>}
                  {MOCK_CODING_QUESTION.sampleOutput && <div style={{ marginTop: "20px" }}><h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Output:</h4><pre className="io-sample-block">{MOCK_CODING_QUESTION.sampleOutput}</pre></div>}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div className="demo-editor-wrapper">
                    <Editor height="100%" defaultLanguage="javascript" theme="vs-dark" value={editorCode} onChange={handleCodeChange} options={{ fontSize: 14, minimap: { enabled: false }, scrollbar: { vertical: "visible", horizontal: "visible" }, padding: { top: 16 } }} />
                  </div>
                  <div className="demo-terminal-wrapper">
                    <div className="terminal-header"><Icon.Terminal /> Output</div>
                    <div className="terminal-body"><pre>{output}</pre></div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
