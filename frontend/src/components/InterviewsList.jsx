import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";

export default function InterviewsList({ user, navigateToDashboard, onJoinInterview }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, [user.role]);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      const url = user.role === "candidate" ? "/api/interviews/my" : "/api/interviews/assigned";
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#9CA3AF", textAlign: "center" }}>
        Loading interviews...
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif" }}>My Interviews</h2>
          <p style={{ color: "#9CA3AF" }}>View and manage your scheduled live interview sessions.</p>
        </div>
        <Button variant="outline" onClick={navigateToDashboard}>Back to Dashboard</Button>
      </div>

      {interviews.length === 0 ? (
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px dashed #333", padding: "64px 24px", textAlign: "center" }}>
          <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.8 }}>📅</div>
            <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px", color: "#EDEDED" }}>
              No interview is scheduled today
            </h3>
            <p style={{ color: "#9CA3AF", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
              New scheduled interview sessions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Click 'Join Session' when it's time for your interview.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {user.role !== "candidate" && <TableHead>Candidate</TableHead>}
                  {user.role !== "interviewer" && <TableHead>Interviewer</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: "right" }}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview._id}>
                    {user.role !== "candidate" && (
                      <TableCell style={{ fontWeight: 500 }}>
                        {interview.candidateId?.name || "Unknown Candidate"}
                      </TableCell>
                    )}
                    {user.role !== "interviewer" && (
                      <TableCell style={{ fontWeight: 500 }}>
                        {interview.interviewerId?.name || "Pending"}
                      </TableCell>
                    )}
                    <TableCell>{formatDate(interview.scheduledDate)}</TableCell>
                    <TableCell>{formatTime(interview.scheduledDate)}</TableCell>
                    <TableCell style={{ textTransform: "capitalize" }}>
                      <Badge variant={interview.status === "ongoing" ? "teal" : "amber"}>
                        {interview.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                      <Button 
                        variant="default" 
                        style={{ backgroundColor: "#D97706", color: "#171717" }}
                        onClick={() => onJoinInterview(interview._id)}
                      >
                        Join Session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
