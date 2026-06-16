import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";

export default function InterviewsList({ user, navigateToDashboard, onJoinInterview }) {
  // Mock scheduled interviews
  const mockInterviews = [
    {
      id: "int_123",
      candidateName: user.role === "candidate" ? user.name : "John Doe",
      interviewerName: user.role === "interviewer" ? user.name : "Jane Smith",
      date: "Today",
      time: "2:00 PM",
      status: "scheduled",
    },
    {
      id: "int_456",
      candidateName: user.role === "candidate" ? user.name : "Alice Johnson",
      interviewerName: user.role === "interviewer" ? user.name : "Bob Ross",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "scheduled",
    }
  ];

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif" }}>My Interviews</h2>
          <p style={{ color: "#9CA3AF" }}>View and manage your scheduled live interview sessions.</p>
        </div>
        <Button variant="outline" onClick={navigateToDashboard}>Back to Dashboard</Button>
      </div>

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
              {mockInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  {user.role !== "candidate" && <TableCell style={{ fontWeight: 500 }}>{interview.candidateName}</TableCell>}
                  {user.role !== "interviewer" && <TableCell style={{ fontWeight: 500 }}>{interview.interviewerName}</TableCell>}
                  <TableCell>{interview.date}</TableCell>
                  <TableCell>{interview.time}</TableCell>
                  <TableCell>
                    <Badge variant="teal">Scheduled</Badge>
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <Button 
                      variant="default" 
                      style={{ backgroundColor: "#D97706", color: "#171717" }}
                      onClick={() => onJoinInterview(interview.id)}
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
    </div>
  );
}
