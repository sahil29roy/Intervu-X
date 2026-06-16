import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function CandidatesList({ user, onJoinInterview }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch("/api/interviews/assigned", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.interviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#9CA3AF", textAlign: "center" }}>
        Loading candidates...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif" }}>Candidates</h2>
      </div>

      {candidates.length === 0 ? (
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px dashed #333", padding: "64px 24px", textAlign: "center" }}>
          <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.8 }}>👥</div>
            <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px", color: "#EDEDED" }}>
              No candidates are currently assigned to you.
            </h3>
            <p style={{ color: "#9CA3AF", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
              Candidates will appear here once an interview is scheduled by an administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #333", backgroundColor: "#262626" }}>
                    <th style={{ padding: "16px 24px", color: "#9CA3AF", fontWeight: 500, fontSize: "13px" }}>Candidate</th>
                    <th style={{ padding: "16px 24px", color: "#9CA3AF", fontWeight: 500, fontSize: "13px" }}>Email</th>
                    <th style={{ padding: "16px 24px", color: "#9CA3AF", fontWeight: 500, fontSize: "13px" }}>Interview Date & Time</th>
                    <th style={{ padding: "16px 24px", color: "#9CA3AF", fontWeight: 500, fontSize: "13px" }}>Status</th>
                    <th style={{ padding: "16px 24px", color: "#9CA3AF", fontWeight: 500, fontSize: "13px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((interview) => {
                    const candidate = interview.candidateId || {};
                    return (
                      <tr key={interview._id} style={{ borderBottom: "1px solid #333", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#262626"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Avatar style={{ width: "32px", height: "32px" }}>
                              <AvatarImage src={candidate.profilePicture} />
                              <AvatarFallback style={{ backgroundColor: "#D97706", color: "#171717", fontSize: "12px" }}>
                                {candidate.name?.charAt(0).toUpperCase() || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <span style={{ fontWeight: 500, color: "#EDEDED" }}>{candidate.name || "Unknown Candidate"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", color: "#9CA3AF", fontSize: "14px" }}>
                          {candidate.email}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ color: "#EDEDED", fontSize: "14px" }}>{formatDate(interview.scheduledDate)}</span>
                            <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{formatTime(interview.scheduledDate)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <Badge style={{ backgroundColor: interview.status === "ongoing" ? "rgba(34,197,94,0.15)" : "rgba(217,119,6,0.15)", color: interview.status === "ongoing" ? "#22C55E" : "#D97706", border: interview.status === "ongoing" ? "1px solid #22C55E" : "1px solid #D97706" }}>
                            {interview.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <Button 
                              variant="outline" 
                              onClick={() => candidate.resumeUrl ? window.open(candidate.resumeUrl, "_blank") : alert("No resume uploaded.")}
                            >
                              View Resume
                            </Button>
                            <Button 
                              style={{ backgroundColor: "#D97706", color: "#171717" }}
                              onClick={() => onJoinInterview(interview._id)}
                            >
                              Open Interview
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
