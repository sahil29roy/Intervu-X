import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table"
import { Progress } from "./ui/progress"
import ProfilePage from "./ProfilePage"
import { MCQTestCandidateView, MCQTestAdminView } from "./McqSystem"
import CodingSandbox from "./CodingSandbox"

export default function Dashboard({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")

  const handleNavClick = (tabId) => {
    setActiveNav(tabId)
  }

  // Get Initials for Avatar Fallback
  const getInitials = (nameStr) => {
    if (!nameStr) return "U"
    return nameStr.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
  }

  // Role Badge Variant
  const getBadgeVariant = (role) => {
    if (role === "candidate") return "teal"
    if (role === "interviewer") return "amber"
    if (role === "admin") return "coral"
    return "default"
  }

  // Icons Helper (Tabler Icons Inline SVG)
  const Icon = {
    Dashboard: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
    Profile: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Tests: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    Coding: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    Interviews: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    Users: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    Settings: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    Logout: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    Search: () => (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    Bell: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    Flame: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    CodeCircle: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="10 9 7 12 10 15" />
        <polyline points="14 15 17 12 14 9" />
      </svg>
    ),
    ChartPie: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    ShieldAlert: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }

  // Navigation schema based on role
  const navItemsByRole = {
    candidate: [
      { id: "dashboard", label: "Dashboard", icon: <Icon.Dashboard /> },
      { id: "profile", label: "Profile", icon: <Icon.Profile /> },
      { id: "tests", label: "Tests", icon: <Icon.Tests /> },
      { id: "sandbox", label: "Coding Sandbox", icon: <Icon.Coding /> },
      { id: "interviews", label: "Interviews", icon: <Icon.Interviews /> }
    ],
    interviewer: [
      { id: "dashboard", label: "Dashboard", icon: <Icon.Dashboard /> },
      { id: "profile", label: "Profile", icon: <Icon.Profile /> },
      { id: "candidates", label: "Candidates", icon: <Icon.Users /> },
      { id: "problems", label: "Problems Bank", icon: <Icon.Coding /> },
      { id: "live", label: "Live Interviews", icon: <Icon.Interviews /> }
    ],
    admin: [
      { id: "dashboard", label: "Dashboard", icon: <Icon.Dashboard /> },
      { id: "users", label: "Users Management", icon: <Icon.Users /> },
      { id: "problems", label: "Problems Bank", icon: <Icon.Coding /> },
      { id: "tests_admin", label: "MCQ Tests", icon: <Icon.Tests /> },
      { id: "interviews_list", label: "Interviews List", icon: <Icon.Interviews /> },
      { id: "profile", label: "Profile", icon: <Icon.Profile /> },
      { id: "settings", label: "Settings", icon: <Icon.Settings /> }
    ]
  }

  const navItems = navItemsByRole[user.role] || navItemsByRole.candidate

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR                                    */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo-container">
          <div className="dashboard-logo">
            Intervux<span className="dashboard-logo-dot">•</span>
          </div>
        </div>

        <nav>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="sidebar-nav-item">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`sidebar-nav-link ${activeNav === item.id ? "active" : ""}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-spacer" />
        <Separator style={{ margin: "16px 0" }} />

        <ul className="sidebar-nav-list">
          <li className="sidebar-nav-item">
            <button
              onClick={onLogout}
              className="sidebar-nav-link logout-link"
            >
              <Icon.Logout />
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* MAIN DASHBOARD AREA                        */}
      <div className="dashboard-main-area">
        {/* Top Navbar */}
        <header className="dashboard-top-navbar">
          <div className="navbar-left">
            <div className="navbar-search-wrapper">
              <span className="navbar-search-icon">
                <Icon.Search />
              </span>
              <Input
                className="navbar-search-input"
                placeholder="Search queries, tests, problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="navbar-right">
            <button className="navbar-notification-btn" aria-label="Notifications">
              <Icon.Bell />
              <span className="navbar-notification-dot" />
            </button>

            <div className="navbar-user-profile">
              <div className="navbar-user-info">
                <span className="navbar-username">{user.name}</span>
                <Badge variant={getBadgeVariant(user.role)} className="navbar-role-badge">
                  {user.role}
                </Badge>
              </div>
              <Avatar className="navbar-avatar" onClick={() => handleNavClick("profile")}>
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>        {/* Scrollable Dashboard Content */}
        <main className="dashboard-content">

          {activeNav === "profile" && (
            <ProfilePage
              onLogout={onLogout}
              navigateToDashboard={() => setActiveNav("dashboard")}
            />
          )}

          {activeNav === "tests" && (
            <MCQTestCandidateView
              user={user}
              navigateToDashboard={() => setActiveNav("dashboard")}
            />
          )}

          {activeNav === "tests_admin" && (
            <MCQTestAdminView
              user={user}
              navigateToDashboard={() => setActiveNav("dashboard")}
            />
          )}

          {activeNav === "sandbox" && (
            <CodingSandbox
              user={user}
              navigateToDashboard={() => setActiveNav("dashboard")}
            />
          )}

          {activeNav !== "dashboard" && activeNav !== "profile" && activeNav !== "tests" && activeNav !== "tests_admin" && activeNav !== "sandbox" && (
            <Card className="profile-section-card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <CardHeader>
                <CardTitle style={{ fontSize: "24px", fontFamily: "Space Grotesk" }}>
                  {navItems.find(item => item.id === activeNav)?.label || "Section"}
                </CardTitle>
                <CardDescription>This section is currently under active development.</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                <p style={{ color: "#9CA3AF" }}>
                  You are viewing the {navItems.find(item => item.id === activeNav)?.label || "Section"} page.
                  Use the sidebar or the button below to navigate back to the main dashboard.
                </p>
                <Button onClick={() => setActiveNav("dashboard")} style={{ width: "auto" }}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {activeNav === "dashboard" && (
            <>

              {/* CANDIDATE MAIN CONTENT                               */}

              {user.role === "candidate" && (
                <>
                  {/* Welcome Banner */}
                  <div className="welcome-banner">
                    <div>
                      <h1 className="welcome-title">Welcome back, {user.name}!</h1>
                      <p className="welcome-subtitle">Ready for your next coding assessment?</p>
                    </div>
                    <Button variant="default" style={{ width: "auto" }} onClick={() => handleNavClick("tests")}>
                      Start Practice Test
                    </Button>
                  </div>

                  {/* Stat Row */}
                  <div className="dashboard-stats-row">
                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Profile />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">85%</span>
                        <span className="dashboard-stat-label">Profile Completion</span>
                      </div>
                      <Progress value={85} />
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Interviews />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">2</span>
                        <span className="dashboard-stat-label">Upcoming Interviews</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.ChartPie />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">88%</span>
                        <span className="dashboard-stat-label">Avg MCQ Score</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Flame />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">0 🔥</span>
                        <span className="dashboard-stat-label">Active Streak</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Widgets */}
                  <div className="dashboard-grid-layout">
                    {/* Left Card: Upcoming Interview & Recent Tests */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Next Scheduled Interview</CardTitle>
                          <CardDescription>Get ready for your live coding round.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="card-list-item" style={{ backgroundColor: "transparent", border: "none", padding: 0 }}>
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.Interviews />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title" style={{ fontSize: "16px" }}>System Design & Coding Assessment</span>
                                <span className="item-subtitle">Interviewer: SDE Lead | June 15, 2026 at 4:00 PM</span>
                              </div>
                            </div>
                            <Badge variant="teal">Scheduled</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="dashboard-card-title-container">
                            <div>
                              <CardTitle>Recent Test Results</CardTitle>
                              <CardDescription>History of your completed tests.</CardDescription>
                            </div>
                            <Button variant="outline" style={{ width: "auto", fontSize: "12px", padding: "6px 12px" }} onClick={() => handleNavClick("tests")}>
                              View All
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Test Name</TableHead>
                                <TableHead>Date Completed</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Frontend Engineer Assessment</TableCell>
                                <TableCell>June 12, 2026</TableCell>
                                <TableCell>90/100</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Passed</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>JavaScript Core Quiz</TableCell>
                                <TableCell>June 08, 2026</TableCell>
                                <TableCell>85/100</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Passed</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Algorithms Basics MCQ</TableCell>
                                <TableCell>May 28, 2026</TableCell>
                                <TableCell>72/100</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Passed</Badge>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Card: Recent Coding Attempts */}
                    <Card>
                      <CardHeader>
                        <div className="dashboard-card-title-container">
                          <div>
                            <CardTitle>Recent Coding Attempts</CardTitle>
                            <CardDescription>Problems solved in the sandbox.</CardDescription>
                          </div>
                          <Button variant="outline" style={{ width: "auto", fontSize: "12px", padding: "6px 12px" }} onClick={() => handleNavClick("sandbox")}>
                            Practice
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="card-list">
                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.CodeCircle />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Two Sum</span>
                                <span className="item-subtitle">JavaScript • Passed all test cases</span>
                              </div>
                            </div>
                            <span className="item-timestamp">2 hrs ago</span>
                          </div>

                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.CodeCircle />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Reverse Integer</span>
                                <span className="item-subtitle">Python • Passed 14/15 test cases</span>
                              </div>
                            </div>
                            <span className="item-timestamp">1 day ago</span>
                          </div>

                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.CodeCircle />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Merge K Sorted Lists</span>
                                <span className="item-subtitle">JavaScript • Time Limit Exceeded</span>
                              </div>
                            </div>
                            <span className="item-timestamp">3 days ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}


              {/* INTERVIEWER MAIN CONTENT                             */}

              {user.role === "interviewer" && (
                <>
                  {/* Welcome Banner */}
                  <div className="welcome-banner">
                    <div>
                      <h1 className="welcome-title">Welcome back, {user.name}!</h1>
                      <p className="welcome-subtitle">You have 3 interviews scheduled today.</p>
                    </div>
                    <Button variant="default" style={{ width: "auto" }} onClick={() => handleNavClick("live")}>
                      Start Interview Session
                    </Button>
                  </div>

                  {/* Stat Row */}
                  <div className="dashboard-stats-row">
                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Interviews />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">3</span>
                        <span className="dashboard-stat-label">Interviews Scheduled Today</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.ShieldAlert />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">2</span>
                        <span className="dashboard-stat-label">Pending Feedback Forms</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Users />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">12</span>
                        <span className="dashboard-stat-label">Total Candidates Evaluated</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Coding />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">8</span>
                        <span className="dashboard-stat-label">Problems Created</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Widgets */}
                  <div className="dashboard-grid-layout">
                    {/* Left Column: Today's Schedule & Recent Candidates */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Today's Schedule</CardTitle>
                          <CardDescription>Your scheduled sessions for today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="card-list">
                            <div className="card-list-item">
                              <div className="item-left-info">
                                <span className="item-icon">
                                  <Icon.Interviews />
                                </span>
                                <div className="item-text-container">
                                  <span className="item-title">Technical Coding (Round 1)</span>
                                  <span className="item-subtitle">Candidate: Emily Blunt • 10:00 AM - 11:00 AM</span>
                                </div>
                              </div>
                              <Badge variant="amber">Next Up</Badge>
                            </div>

                            <div className="card-list-item">
                              <div className="item-left-info">
                                <span className="item-icon">
                                  <Icon.Interviews />
                                </span>
                                <div className="item-text-container">
                                  <span className="item-title">System Design & Core Java</span>
                                  <span className="item-subtitle">Candidate: John Krasinski • 2:00 PM - 3:00 PM</span>
                                </div>
                              </div>
                              <Badge variant="outline">Scheduled</Badge>
                            </div>

                            <div className="card-list-item" style={{ opacity: 0.6 }}>
                              <div className="item-left-info">
                                <span className="item-icon">
                                  <Icon.Interviews />
                                </span>
                                <div className="item-text-container">
                                  <span className="item-title">Algorithms & Problem Solving</span>
                                  <span className="item-subtitle">Candidate: Ryan Reynolds • 8:30 AM - 9:30 AM</span>
                                </div>
                              </div>
                              <Badge variant="teal">Completed</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="dashboard-card-title-container">
                            <div>
                              <CardTitle>Recent Candidates Assigned</CardTitle>
                              <CardDescription>Candidates assigned to you for assessment.</CardDescription>
                            </div>
                            <Button variant="outline" style={{ width: "auto", fontSize: "12px", padding: "6px 12px" }} onClick={() => handleNavClick("candidates")}>
                              View All
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Candidate Name</TableHead>
                                <TableHead>Applied For</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Assigned Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Emily Blunt</TableCell>
                                <TableCell>Senior Fullstack Engineer</TableCell>
                                <TableCell>5+ Years</TableCell>
                                <TableCell>June 10, 2026</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>John Krasinski</TableCell>
                                <TableCell>Lead Backend Developer</TableCell>
                                <TableCell>8+ Years</TableCell>
                                <TableCell>June 08, 2026</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Ryan Reynolds</TableCell>
                                <TableCell>Senior Frontend Engineer</TableCell>
                                <TableCell>6 Years</TableCell>
                                <TableCell>June 05, 2026</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Quick Action Links */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Shortcut shortcuts for common tasks.</CardDescription>
                      </CardHeader>
                      <CardContent style={{ gap: "12px" }}>
                        <Button variant="default" onClick={() => handleNavClick("problems")}>
                          Create New Coding Problem
                        </Button>
                        <Button variant="outline" onClick={() => handleNavClick("live")}>
                          Start Sandbox Environment
                        </Button>
                        <Button variant="outline" onClick={() => handleNavClick("candidates")}>
                          Submit Pending Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}


              {/* ADMIN MAIN CONTENT                                   */}

              {user.role === "admin" && (
                <>
                  {/* Welcome Banner */}
                  <div className="welcome-banner">
                    <div>
                      <h1 className="welcome-title">Welcome back, Admin Console!</h1>
                      <p className="welcome-subtitle">Platform is currently running smoothly.</p>
                    </div>
                    <Button variant="default" style={{ width: "auto" }} onClick={() => handleNavClick("users")}>
                      Manage Platform Users
                    </Button>
                  </div>

                  {/* Stat Row */}
                  <div className="dashboard-stats-row">
                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Users />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">842</span>
                        <span className="dashboard-stat-label">Total Candidates</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Profile />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">124</span>
                        <span className="dashboard-stat-label">Total Interviewers</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.Interviews />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">3,410</span>
                        <span className="dashboard-stat-label">Total Interviews Conducted</span>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-icon-wrapper">
                        <Icon.ShieldAlert />
                      </div>
                      <div className="dashboard-stat-details">
                        <span className="dashboard-stat-number">0</span>
                        <span className="dashboard-stat-label">Pending Security Reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Widgets */}
                  <div className="dashboard-grid-layout">
                    {/* Left Column: Upcoming Interviews & Recent Registrations */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <Card>
                        <CardHeader>
                          <div className="dashboard-card-title-container">
                            <div>
                              <CardTitle>Global Upcoming Interviews</CardTitle>
                              <CardDescription>Scheduled active sessions across the platform.</CardDescription>
                            </div>
                            <Button variant="outline" style={{ width: "auto", fontSize: "12px", padding: "6px 12px" }} onClick={() => handleNavClick("interviews_list")}>
                              View All
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Interviewer</TableHead>
                                <TableHead>Date / Time</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Emily Blunt</TableCell>
                                <TableCell>Tech SDE Lead</TableCell>
                                <TableCell>June 15 • 10:00 AM</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Confirmed</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>John Krasinski</TableCell>
                                <TableCell>SDE 3 Backend</TableCell>
                                <TableCell>June 15 • 2:00 PM</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Confirmed</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Steve Carell</TableCell>
                                <TableCell>Staff Architect</TableCell>
                                <TableCell>June 16 • 11:30 AM</TableCell>
                                <TableCell>
                                  <Badge variant="amber">Pending Approval</Badge>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="dashboard-card-title-container">
                            <div>
                              <CardTitle>Recent User Registrations</CardTitle>
                              <CardDescription>Latest users joined Intervux.</CardDescription>
                            </div>
                            <Button variant="outline" style={{ width: "auto", fontSize: "12px", padding: "6px 12px" }} onClick={() => handleNavClick("users")}>
                              Manage Users
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email Address</TableHead>
                                <TableHead>Joined Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Dwight Schrute</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Candidate</Badge>
                                </TableCell>
                                <TableCell>dwight@dundermifflin.com</TableCell>
                                <TableCell>Today, 10:24 AM</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Michael Scott</TableCell>
                                <TableCell>
                                  <Badge variant="amber">Interviewer</Badge>
                                </TableCell>
                                <TableCell>michael.scott@dundermifflin.com</TableCell>
                                <TableCell>Yesterday, 4:15 PM</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ fontWeight: 500 }}>Pam Beesly</TableCell>
                                <TableCell>
                                  <Badge variant="teal">Candidate</Badge>
                                </TableCell>
                                <TableCell>pam@dundermifflin.com</TableCell>
                                <TableCell>June 11, 2026</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Platform Statistics Cards */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Platform Problem Database</CardTitle>
                        <CardDescription>Statistics of code problems bank.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="card-list">
                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.Coding />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Total Active Problems</span>
                                <span className="item-subtitle">Problems in bank available for tests</span>
                              </div>
                            </div>
                            <span className="dashboard-stat-number" style={{ fontSize: "18px" }}>86</span>
                          </div>

                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.CodeCircle />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Total Solved Submissions</span>
                                <span className="item-subtitle">Correct answers compiled</span>
                              </div>
                            </div>
                            <span className="dashboard-stat-number" style={{ fontSize: "18px" }}>12,450</span>
                          </div>

                          <div className="card-list-item">
                            <div className="item-left-info">
                              <span className="item-icon">
                                <Icon.ShieldAlert />
                              </span>
                              <div className="item-text-container">
                                <span className="item-title">Pending Reports / Bugs</span>
                                <span className="item-subtitle">User reported issues</span>
                              </div>
                            </div>
                            <span className="dashboard-stat-number" style={{ fontSize: "18px", color: "#EF4444" }}>0</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
