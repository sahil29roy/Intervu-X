import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"

export default function ProfilePage({ onLogout, navigateToDashboard }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [resumeLoading, setResumeLoading] = useState(false)
  const [fetchError, setFetchError] = useState("")

  // Form draft state
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    headline: "",
    bio: "",
    designation: "",
    company: "",
    yearsOfExperience: "",
    skills: [],
    expertiseAreas: [],
    githubLink: "",
    linkedinLink: "",
    portfolioLink: "",
    education: {
      degree: "",
      branch: "",
      college: "",
      startYear: "",
      endYear: "",
      cgpa: "",
    },
    preferredRole: "",
    preferredLocation: "",
  })

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({})

  // Skills & Expertise inputs
  const [newSkill, setNewSkill] = useState("")
  const [newExpertise, setNewExpertise] = useState("")

  // Dynamic stats
  const [codingSubmissions, setCodingSubmissions] = useState([])
  const [interviewerInterviews, setInterviewerInterviews] = useState([])
  const [interviewerQuestions, setInterviewerQuestions] = useState([])

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [user?.role])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("intervux_token")
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch("/api/auth/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
      } else {
        setFetchError(data.message || "Failed to load profile.")
        if (response.status === 401) {
          onLogout()
        }
      }
    } catch (err) {
      setFetchError("Cannot connect to server. Check if backend is running.")
    } finally {
      setIsInitializing(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("intervux_token")
      if (!token) return
      const headers = { Authorization: `Bearer ${token}` }

      if (user?.role === "candidate") {
        const res = await fetch("/api/coding/submissions/my", { headers })
        if (res.ok) {
          const data = await res.json()
          setCodingSubmissions(data.submissions || [])
        }
      } else if (user?.role === "interviewer") {
        const [interviewsRes, questionsRes] = await Promise.all([
          fetch("/api/interviews/assigned", { headers }),
          fetch("/api/coding/questions", { headers })
        ])
        if (interviewsRes.ok) {
          const data = await interviewsRes.json()
          setInterviewerInterviews(data.interviews || [])
        }
        if (questionsRes.ok) {
          const data = await questionsRes.json()
          setInterviewerQuestions(data.questions || [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats", err)
    }
  }

  // Handle Edit State Toggle
  const enterEditMode = () => {
    setDraft({
      name: user.name || "",
      phone: user.phone || "",
      headline: user.headline || "",
      bio: user.bio || "",
      designation: user.designation || "",
      company: user.company || "",
      yearsOfExperience: user.yearsOfExperience !== null && user.yearsOfExperience !== undefined ? user.yearsOfExperience : "",
      skills: [...(user.skills || [])],
      expertiseAreas: [...(user.expertiseAreas || [])],
      githubLink: user.githubLink || "",
      linkedinLink: user.linkedinLink || "",
      portfolioLink: user.portfolioLink || "",
      education: {
        degree: user.education?.degree || "",
        branch: user.education?.branch || "",
        college: user.education?.college || "",
        startYear: user.education?.startYear !== null && user.education?.startYear !== undefined ? user.education?.startYear : "",
        endYear: user.education?.endYear !== null && user.education?.endYear !== undefined ? user.education?.endYear : "",
        cgpa: user.education?.cgpa !== null && user.education?.cgpa !== undefined ? user.education?.cgpa : "",
      },
      preferredRole: user.preferredRole || "",
      preferredLocation: user.preferredLocation || "",
    })
    setValidationErrors({})
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValidationErrors({})
  }

  // Handle Field Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDraft((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleEducationChange = (e) => {
    const { name, value } = e.target
    setDraft((prev) => ({
      ...prev,
      education: { ...prev.education, [name]: value }
    }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Add & Delete Tag chips
  const addSkill = () => {
    if (newSkill.trim() && !draft.skills.includes(newSkill.trim())) {
      setDraft((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (indexToRemove) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove)
    }))
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !draft.expertiseAreas.includes(newExpertise.trim())) {
      setDraft((prev) => ({
        ...prev,
        expertiseAreas: [...prev.expertiseAreas, newExpertise.trim()]
      }))
      setNewExpertise("")
    }
  }

  const removeExpertise = (indexToRemove) => {
    setDraft((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter((_, idx) => idx !== indexToRemove)
    }))
  }

  // Input fields validation
  const validateForm = () => {
    const errors = {}
    if (!draft.name.trim()) {
      errors.name = "Name is required"
    }

    if (user.role === "interviewer") {
      if (draft.yearsOfExperience !== "") {
        const exp = Number(draft.yearsOfExperience)
        if (isNaN(exp) || exp < 0) {
          errors.yearsOfExperience = "Must be a non-negative number"
        }
      }
    }

    if (user.role === "candidate") {
      const start = draft.education.startYear !== "" ? Number(draft.education.startYear) : null
      const end = draft.education.endYear !== "" ? Number(draft.education.endYear) : null
      const cgpa = draft.education.cgpa !== "" ? Number(draft.education.cgpa) : null

      if (start && (isNaN(start) || start < 1900 || start > 2100)) {
        errors.startYear = "Invalid start year (1900-2100)"
      }
      if (end && (isNaN(end) || end < 1900 || end > 2100)) {
        errors.endYear = "Invalid end year (1900-2100)"
      }
      if (start && end && end < start) {
        errors.endYear = "End year cannot precede start year"
      }
      if (cgpa !== null && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) {
        errors.cgpa = "CGPA must be between 0.0 and 10.0"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem("intervux_token")

      // Prep body fields, convert numbers where appropriate
      const bodyData = {
        name: draft.name,
        phone: draft.phone,
        headline: draft.headline,
        bio: draft.bio,
        designation: draft.designation,
        company: draft.company,
        githubLink: draft.githubLink,
        linkedinLink: draft.linkedinLink,
        portfolioLink: draft.portfolioLink,
      }

      if (user.role === "interviewer") {
        bodyData.yearsOfExperience = draft.yearsOfExperience !== "" ? Number(draft.yearsOfExperience) : null
        bodyData.expertiseAreas = draft.expertiseAreas
      }

      if (user.role === "candidate") {
        bodyData.preferredRole = draft.preferredRole
        bodyData.preferredLocation = draft.preferredLocation
        bodyData.skills = draft.skills
        bodyData.education = {
          degree: draft.education.degree,
          branch: draft.education.branch,
          college: draft.education.college,
          startYear: draft.education.startYear !== "" ? Number(draft.education.startYear) : null,
          endYear: draft.education.endYear !== "" ? Number(draft.education.endYear) : null,
          cgpa: draft.education.cgpa !== "" ? Number(draft.education.cgpa) : null,
        }
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      })

      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("intervux_user", JSON.stringify(data.user))
        setIsEditing(false)
      } else {
        console.log(data.message || "Failed to update profile")
      }
    } catch (err) {
      console.log("Error saving profile changes")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Profile Pic Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("profilePicture", file)

    setUploadLoading(true)
    try {
      const token = localStorage.getItem("intervux_token")
      const response = await fetch("/api/auth/profile/upload-pic", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("intervux_user", JSON.stringify(data.user))
      } else {
        console.log(data.message || "Failed to upload profile picture")
      }
    } catch (err) {
      console.log("Error connecting to server to upload picture")
    } finally {
      setUploadLoading(false)
    }
  }

  // Handle Resume Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("resume", file)

    setResumeLoading(true)
    try {
      const token = localStorage.getItem("intervux_token")
      const response = await fetch("/api/auth/profile/upload-resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem("intervux_user", JSON.stringify(data.user))
      } else {
        console.log(data.message || "Failed to upload resume")
      }
    } catch (err) {
      console.log("Error connecting to server to upload resume")
    } finally {
      setResumeLoading(false)
    }
  }

  // Render Loader
  if (isInitializing) {
    return (
      <div className="auth-page-container">
        <div className="spinner" style={{ width: "40px", height: "40px", borderWidth: "3px" }}></div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="auth-page-container">
        <Card style={{ maxWidth: "400px", textAlign: "center" }}>
          <CardHeader>
            <CardTitle style={{ color: "#EF4444" }}>Error Loading Profile</CardTitle>
            <CardDescription>{fetchError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchProfile} variant="default">Retry</Button>
          </CardContent>
          <CardFooter>
            <span className="auth-link" onClick={onLogout}>Return to Sign In</span>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Get Initials for Avatar Fallback
  const getInitials = (nameStr) => {
    if (!nameStr) return "U"
    return nameStr.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
  }

  // Get Badge Color variant class name
  const getBadgeVariant = (role) => {
    if (role === "candidate") return "teal"
    if (role === "interviewer") return "amber"
    if (role === "admin") return "coral"
    return "default"
  }

  // Human-readable resume filename
  const getResumeFilename = (url) => {
    if (!url) return ""
    const parts = url.split("/")
    return parts[parts.length - 1]
  }

  const solvedCount = new Set(
    codingSubmissions
      .filter((sub) => sub.verdict === "Accepted")
      .map((sub) => sub.questionId?._id || sub.questionId)
      .filter(Boolean)
  ).size;

  const totalSubmissions = codingSubmissions.length;
  const acceptanceRate = totalSubmissions > 0
    ? Math.round((codingSubmissions.filter(s => s.verdict === "Accepted").length / totalSubmissions) * 100)
    : 0;

  return (
    <div className={`profile-container ${isEditing ? "profile-padding-bottom" : ""}`}>


      {/* LEFT COLUMN: Sticky Sidebar & Stats        */}

      <div className="profile-sidebar">

        {/* Profile Card */}
        <div className="profile-sidebar-card">
          {/* Avatar Upload Hover Overlay */}
          <div className="avatar-upload-container">
            <Avatar>
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="avatar-upload-overlay">
              {uploadLoading ? (
                <div className="spinner" style={{ marginRight: 0 }}></div>
              ) : (
                <svg className="avatar-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="avatar-file-input"
              onChange={handleAvatarUpload}
              disabled={uploadLoading}
            />
          </div>

          <h2 className="profile-sidebar-name">{user.name}</h2>

          <Badge variant={getBadgeVariant(user.role)}>
            {user.role}
          </Badge>

          {user.headline ? (
            <p className="profile-sidebar-headline">{user.headline}</p>
          ) : (
            <p className="profile-sidebar-headline" style={{ fontStyle: "italic", opacity: 0.5 }}>
              No headline set
            </p>
          )}

          <div className="profile-sidebar-actions">
            {!isEditing && (
              <Button onClick={enterEditMode} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Activity Stats Card */}
        <div className="profile-stats-card">
          <h3 className="profile-stats-title">Platform Stats</h3>

          {user.role === "candidate" && (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{solvedCount}</span>
                <span className="stat-label">Solved</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{totalSubmissions}</span>
                <span className="stat-label">Submissions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{acceptanceRate}%</span>
                <span className="stat-label">Acceptance</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0 🔥</span>
                <span className="stat-label">Streak</span>
              </div>
            </div>
          )}

          {user.role === "interviewer" && (
            <div className="stats-grid stats-grid-full">
              <div className="stat-item">
                <span className="stat-value">{interviewerInterviews.length}</span>
                <span className="stat-label">Interviews Conducted</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{interviewerQuestions.length}</span>
                <span className="stat-label">Problems Created</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">5.0 ⭐</span>
                <span className="stat-label">Avg rating</span>
              </div>
            </div>
          )}

          {user.role === "admin" && (
            <div className="stats-grid stats-grid-full">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Total Problems</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0 ⚠️</span>
                <span className="stat-label">Pending reports</span>
              </div>
            </div>
          )}
        </div>

        <Button onClick={navigateToDashboard} variant="default" style={{ marginBottom: "8px" }}>
          Back to Dashboard
        </Button>
        <Button onClick={onLogout} variant="outline" style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#EF4444" }}>
          Log Out
        </Button>
      </div>

      {/* RIGHT COLUMN: Role-specific Content        */}

      <div className="profile-main-content">

        {/* ==================== CANDIDATE VIEW ==================== */}
        {user.role === "candidate" && (
          <>
            {/* About Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">About Me</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={draft.name}
                        onChange={handleInputChange}
                      />
                      {validationErrors.name && (
                        <span className="error-message">{validationErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edit-headline">Headline</Label>
                      <Input
                        id="edit-headline"
                        name="headline"
                        value={draft.headline}
                        onChange={handleInputChange}
                        placeholder="e.g. Full Stack Developer | React & Node"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edit-designation">Designation</Label>
                      <Input
                        id="edit-designation"
                        name="designation"
                        value={draft.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Software Development Engineer"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edit-company">Company / Institute</Label>
                      <Input
                        id="edit-company"
                        name="company"
                        value={draft.company}
                        onChange={handleInputChange}
                        placeholder="e.g. TechCorp or Stanford"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edit-preferredRole">Preferred Role</Label>
                      <Input
                        id="edit-preferredRole"
                        name="preferredRole"
                        value={draft.preferredRole}
                        onChange={handleInputChange}
                        placeholder="e.g. Frontend SDE"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edit-preferredLocation">Preferred Location</Label>
                      <Input
                        id="edit-preferredLocation"
                        name="preferredLocation"
                        value={draft.preferredLocation}
                        onChange={handleInputChange}
                        placeholder="e.g. Remote, New York"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="edit-bio">Bio</Label>
                      <Textarea
                        id="edit-bio"
                        name="bio"
                        value={draft.bio}
                        onChange={handleInputChange}
                        placeholder="Tell recruiters about yourself, projects, and goals..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="profile-static-label">Designation</h4>
                      <p className={user.designation ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.designation || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Company / Institute</h4>
                      <p className={user.company ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.company || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Preferred Role</h4>
                      <p className={user.preferredRole ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.preferredRole || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Preferred Location</h4>
                      <p className={user.preferredLocation ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.preferredLocation || "Not specified"}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <h4 className="profile-static-label">Bio</h4>
                      <p className={user.bio ? "profile-static-value" : "profile-static-value-empty"} style={{ whiteSpace: "pre-wrap" }}>
                        {user.bio || "No biography added yet."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Skills Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Technical Skills</h3>
              </div>

              {isEditing ? (
                <div>
                  <div className="tags-container">
                    {draft.skills.map((skill, idx) => (
                      <span key={idx} className="tag-chip">
                        {skill}
                        <button
                          type="button"
                          className="tag-chip-delete"
                          onClick={() => removeSkill(idx)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {draft.skills.length === 0 && (
                      <span className="profile-static-value-empty">No skills added yet.</span>
                    )}
                  </div>

                  <div className="add-tag-container">
                    <Input
                      placeholder="Add a skill (e.g. React)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      variant="outline"
                      style={{ width: "auto" }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="tags-container">
                  {user.skills && user.skills.map((skill, idx) => (
                    <span key={idx} className="tag-chip">
                      {skill}
                    </span>
                  ))}
                  {(!user.skills || user.skills.length === 0) && (
                    <span className="profile-static-value-empty">No skills cataloged. Click Edit Profile to add.</span>
                  )}
                </div>
              )}
            </Card>

            {/* Education Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Education</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="edu-degree">Degree</Label>
                      <Input
                        id="edu-degree"
                        name="degree"
                        value={draft.education.degree}
                        onChange={handleEducationChange}
                        placeholder="e.g. Bachelor of Science"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edu-branch">Branch / Major</Label>
                      <Input
                        id="edu-branch"
                        name="branch"
                        value={draft.education.branch}
                        onChange={handleEducationChange}
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="edu-college">College / University</Label>
                      <Input
                        id="edu-college"
                        name="college"
                        value={draft.education.college}
                        onChange={handleEducationChange}
                        placeholder="e.g. Harvard University"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edu-startYear">Start Year</Label>
                      <Input
                        id="edu-startYear"
                        name="startYear"
                        type="number"
                        placeholder="YYYY"
                        value={draft.education.startYear}
                        onChange={handleEducationChange}
                      />
                      {validationErrors.startYear && (
                        <span className="error-message">{validationErrors.startYear}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edu-endYear">End Year</Label>
                      <Input
                        id="edu-endYear"
                        name="endYear"
                        type="number"
                        placeholder="YYYY"
                        value={draft.education.endYear}
                        onChange={handleEducationChange}
                      />
                      {validationErrors.endYear && (
                        <span className="error-message">{validationErrors.endYear}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <Label htmlFor="edu-cgpa">CGPA / GPA</Label>
                      <Input
                        id="edu-cgpa"
                        name="cgpa"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 9.1 or 3.8"
                        value={draft.education.cgpa}
                        onChange={handleEducationChange}
                      />
                      {validationErrors.cgpa && (
                        <span className="error-message">{validationErrors.cgpa}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="profile-static-label">Degree & Branch</h4>
                      <p className={user.education?.degree ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.education?.degree
                          ? `${user.education.degree}${user.education.branch ? ` in ${user.education.branch}` : ""}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">College / University</h4>
                      <p className={user.education?.college ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.education?.college || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Years of Study</h4>
                      <p className={user.education?.startYear ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.education?.startYear
                          ? `${user.education.startYear} – ${user.education.endYear || "Present"}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">CGPA / GPA</h4>
                      <p className={user.education?.cgpa ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.education?.cgpa || "Not specified"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Links Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Online Profiles</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="link-github">GitHub Link</Label>
                      <Input
                        id="link-github"
                        name="githubLink"
                        value={draft.githubLink}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="link-linkedin">LinkedIn Link</Label>
                      <Input
                        id="link-linkedin"
                        name="linkedinLink"
                        value={draft.linkedinLink}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="link-portfolio">Portfolio Link</Label>
                      <Input
                        id="link-portfolio"
                        name="portfolioLink"
                        value={draft.portfolioLink}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="link-item">
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      {user.githubLink ? (
                        <a href={user.githubLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          GitHub
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">GitHub link not added</span>
                      )}
                    </div>

                    <div className="link-item">
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                      {user.linkedinLink ? (
                        <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          LinkedIn
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">LinkedIn link not added</span>
                      )}
                    </div>

                    <div className="link-item" style={{ gridColumn: "span 2" }}>
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      {user.portfolioLink ? (
                        <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          Portfolio website
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">Portfolio link not added</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Resume Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Resume</h3>
              </div>

              <div className="resume-card-body">
                <div className="resume-details">
                  <svg className="resume-icon" width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>

                  <div className="resume-info">
                    {user.resumeUrl ? (
                      <>
                        <a
                          href={user.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-filename"
                          title={getResumeFilename(user.resumeUrl)}
                        >
                          {getResumeFilename(user.resumeUrl)}
                        </a>
                        <span className="resume-size">PDF Document (Click to view/download)</span>
                      </>
                    ) : (
                      <>
                        <span className="resume-filename" style={{ opacity: 0.5 }}>No Resume Uploaded</span>
                        <span className="resume-size">Upload a resume to apply for coding jobs</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="resume-upload-btn-wrapper">
                  <Button variant="outline" disabled={resumeLoading} style={{ position: "relative" }}>
                    {resumeLoading && <div className="spinner"></div>}
                    {user.resumeUrl ? "Replace Resume" : "Upload Resume"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="resume-file-input"
                      onChange={handleResumeUpload}
                      disabled={resumeLoading}
                    />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/*  INTERVIEWER VIEW  */}
        {user.role === "interviewer" && (
          <>
            {/* About Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Interviewer Profile</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="int-name">Full Name</Label>
                      <Input
                        id="int-name"
                        name="name"
                        value={draft.name}
                        onChange={handleInputChange}
                      />
                      {validationErrors.name && (
                        <span className="error-message">{validationErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <Label htmlFor="int-headline">Headline</Label>
                      <Input
                        id="int-headline"
                        name="headline"
                        value={draft.headline}
                        onChange={handleInputChange}
                        placeholder="e.g. Staff Architect | Java Specialist"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="int-designation">Designation</Label>
                      <Input
                        id="int-designation"
                        name="designation"
                        value={draft.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Staff Engineer"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="int-company">Company</Label>
                      <Input
                        id="int-company"
                        name="company"
                        value={draft.company}
                        onChange={handleInputChange}
                        placeholder="e.g. Google"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="int-yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="int-yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        placeholder="e.g. 8"
                        value={draft.yearsOfExperience}
                        onChange={handleInputChange}
                      />
                      {validationErrors.yearsOfExperience && (
                        <span className="error-message">{validationErrors.yearsOfExperience}</span>
                      )}
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="int-bio">Bio</Label>
                      <Textarea
                        id="int-bio"
                        name="bio"
                        value={draft.bio}
                        onChange={handleInputChange}
                        placeholder="Talk about your interviewing experience, philosophy, or technical background..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="profile-static-label">Designation</h4>
                      <p className={user.designation ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.designation || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Company</h4>
                      <p className={user.company ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.company || "Not specified"}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <h4 className="profile-static-label">Years of Experience</h4>
                      <p className={user.yearsOfExperience !== null && user.yearsOfExperience !== undefined ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.yearsOfExperience !== null && user.yearsOfExperience !== undefined
                          ? `${user.yearsOfExperience} years`
                          : "Not specified"}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <h4 className="profile-static-label">Bio</h4>
                      <p className={user.bio ? "profile-static-value" : "profile-static-value-empty"} style={{ whiteSpace: "pre-wrap" }}>
                        {user.bio || "No biography added yet."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Expertise Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Areas of Expertise</h3>
              </div>

              {isEditing ? (
                <div>
                  <div className="tags-container">
                    {draft.expertiseAreas.map((exp, idx) => (
                      <span key={idx} className="tag-chip">
                        {exp}
                        <button
                          type="button"
                          className="tag-chip-delete"
                          onClick={() => removeExpertise(idx)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {draft.expertiseAreas.length === 0 && (
                      <span className="profile-static-value-empty">No expertise areas configured.</span>
                    )}
                  </div>

                  <div className="add-tag-container">
                    <Input
                      placeholder="Add area (e.g. System Design)"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addExpertise()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addExpertise}
                      variant="outline"
                      style={{ width: "auto" }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="tags-container">
                  {user.expertiseAreas && user.expertiseAreas.map((exp, idx) => (
                    <span key={idx} className="tag-chip">
                      {exp}
                    </span>
                  ))}
                  {(!user.expertiseAreas || user.expertiseAreas.length === 0) && (
                    <span className="profile-static-value-empty">No expertise tags added yet. Click Edit Profile.</span>
                  )}
                </div>
              )}
            </Card>

            {/* Links Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Online Profiles</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="int-link-github">GitHub Link</Label>
                      <Input
                        id="int-link-github"
                        name="githubLink"
                        value={draft.githubLink}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="int-link-linkedin">LinkedIn Link</Label>
                      <Input
                        id="int-link-linkedin"
                        name="linkedinLink"
                        value={draft.linkedinLink}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="int-link-portfolio">Portfolio Link</Label>
                      <Input
                        id="int-link-portfolio"
                        name="portfolioLink"
                        value={draft.portfolioLink}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="link-item">
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      {user.githubLink ? (
                        <a href={user.githubLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          GitHub
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">GitHub link not added</span>
                      )}
                    </div>

                    <div className="link-item">
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                      {user.linkedinLink ? (
                        <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          LinkedIn
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">LinkedIn link not added</span>
                      )}
                    </div>

                    <div className="link-item" style={{ gridColumn: "span 2" }}>
                      <svg className="link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      {user.portfolioLink ? (
                        <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="link-anchor">
                          Portfolio website
                        </a>
                      ) : (
                        <span className="profile-static-value-empty">Portfolio link not added</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </>
        )}

        {/* ==================== ADMIN VIEW ==================== */}
        {user.role === "admin" && (
          <>
            {/* About Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Administrative Profile</h3>
              </div>

              <div className="profile-grid-fields">
                {isEditing ? (
                  <>
                    <div className="form-group">
                      <Label htmlFor="adm-name">Full Name</Label>
                      <Input
                        id="adm-name"
                        name="name"
                        value={draft.name}
                        onChange={handleInputChange}
                      />
                      {validationErrors.name && (
                        <span className="error-message">{validationErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <Label htmlFor="adm-phone">Phone Number</Label>
                      <Input
                        id="adm-phone"
                        name="phone"
                        value={draft.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <Label htmlFor="adm-headline">Admin Headline</Label>
                      <Input
                        id="adm-headline"
                        name="headline"
                        value={draft.headline}
                        onChange={handleInputChange}
                        placeholder="e.g. Lead Platform Administrator"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="profile-static-label">Email Address</h4>
                      <p className="profile-static-value">{user.email}</p>
                    </div>

                    <div>
                      <h4 className="profile-static-label">Phone</h4>
                      <p className={user.phone ? "profile-static-value" : "profile-static-value-empty"}>
                        {user.phone || "Not specified"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Admin Actions Card */}
            <Card className="profile-section-card">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Admin Management Panels</h3>
              </div>

              <div className="admin-actions-grid">
                <Button variant="outline" onClick={() => console.log("Redirecting to User Management...")}>
                  Manage Platform Users
                </Button>
                <Button variant="outline" onClick={() => console.log("Redirecting to Problem Bank Editor...")}>
                  Manage Assessment Problems
                </Button>
                <Button variant="outline" onClick={() => console.log("Loading Audit logs...")}>
                  View Activity Logs
                </Button>
                <Button
                  variant="outline"
                  style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "#F59E0B" }}
                  onClick={() => console.log("No reports outstanding")}
                >
                  Inspect Flagged Content
                </Button>
              </div>
            </Card>
          </>
        )}

      </div>


      {/* STICKY BOTTOM EDIT CONTROLS BAR            */}

      {isEditing && (
        <div className="edit-mode-bar animate-fadeIn">
          <div className="edit-mode-bar-content">
            <span className="edit-mode-bar-status">
              {isSaving && <div className="spinner"></div>}
              {isSaving ? "Saving profile updates..." : "🔒 You are editing your profile fields"}
            </span>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
              style={{ width: "auto" }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              variant="default"
              disabled={isSaving}
              style={{ width: "auto" }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
