import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";

const Icon = {
  Play: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Submit: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  ),
  Back: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
};

const DEFAULT_BOILERPLATE = `// Write your JavaScript solution here
// Use readLine() to read input line-by-line, and console.log() to print outputs

const a = parseInt(readLine());
const b = parseInt(readLine());
console.log(a + b);
`;

export default function CodingSandbox({ user, navigateToDashboard }) {
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Workspace state
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [editorCode, setEditorCode] = useState("");
  const [activeTab, setActiveTab] = useState("code"); // "code" | "submissions"
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [showFailedDetails, setShowFailedDetails] = useState(false);

  // Split-pane resizer state
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const splitPaneRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);
      setErrorMsg("");

      const [questionsRes, submissionsRes] = await Promise.all([
        fetch("/api/coding/questions", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/coding/submissions/my", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (questionsRes.ok && submissionsRes.ok) {
        const questionsData = await questionsRes.json();
        const submissionsData = await submissionsRes.json();
        setProblems(questionsData.questions);
        setSubmissions(submissionsData.submissions);
      } else {
        setErrorMsg("Failed to load coding questions or submission logs.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server. Please check api health.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProblem = (prob) => {
    setSelectedProblem(prob);
    setVerdict(null);
    setShowFailedDetails(false);
    setActiveTab("code");

    // Load draft from localStorage or fallback to default boilerplate
    const stored = localStorage.getItem(`draft_${prob._id}_${user._id}`);
    if (stored) {
      setEditorCode(stored);
    } else {
      setEditorCode(DEFAULT_BOILERPLATE);
    }
  };

  const handleCodeChange = (value) => {
    setEditorCode(value);
    if (selectedProblem) {
      localStorage.setItem(`draft_${selectedProblem._id}_${user._id}`, value);
    }
  };

  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your editor to the boilerplate template? This will discard your current draft.")) {
      setEditorCode(DEFAULT_BOILERPLATE);
      if (selectedProblem) {
        localStorage.setItem(`draft_${selectedProblem._id}_${user._id}`, DEFAULT_BOILERPLATE);
      }
    }
  };

  const handleSubmitCode = async () => {
    if (!editorCode.trim()) return;
    setSubmitting(true);
    setVerdict(null);
    setShowFailedDetails(false);

    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch(`/api/coding/questions/${selectedProblem._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          language: "javascript",
          sourceCode: editorCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerdict(data);
        // Refresh submissions
        const subsRes = await fetch("/api/coding/submissions/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setSubmissions(subsData.submissions);
        }
      } else {
        console.log(data.message || "Failed to evaluate code submission.");
      }
    } catch (err) {
      console.log("Error sending submission to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunTests = async () => {
    if (!editorCode.trim()) return;
    setSubmitting(true);
    setVerdict(null);
    setShowFailedDetails(false);

    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch(`/api/coding/questions/${selectedProblem._id}/run-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          language: "javascript",
          sourceCode: editorCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerdict(data);
      } else {
        console.log(data.message || "Failed to evaluate code.");
      }
    } catch (err) {
      console.log("Error sending code to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Split resizer dragging logic
  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !splitPaneRef.current) return;
    const containerRect = splitPaneRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Bounds between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  const getDifficultyBadge = (diff) => {
    if (diff === "easy") return <Badge variant="teal" style={{ textTransform: "capitalize" }}>Easy</Badge>;
    if (diff === "medium") return <Badge variant="amber" style={{ textTransform: "capitalize" }}>Medium</Badge>;
    return <Badge variant="coral" style={{ textTransform: "capitalize" }}>Hard</Badge>;
  };

  const isSolved = (probId) => {
    return submissions.some(sub => sub.questionId?._id === probId && sub.verdict === "Accepted");
  };

  if (loading && problems.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  // WORKSPACE VIEW (SINGLE PROBLEM ACTIVE)
  if (selectedProblem) {
    const problemSubmissions = submissions.filter(
      (sub) => sub.questionId?._id === selectedProblem._id
    );

    return (
      <div className="coding-workspace-wrapper">
        {/* Workspace Header */}
        <div className="coding-workspace-header">
          <Button variant="outline" onClick={() => setSelectedProblem(null)} style={{ width: "auto", padding: "8px 12px" }}>
            <Icon.Back /> Back to Problems
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk", color: "#EDEDED", fontWeight: 500 }}>
              {selectedProblem.title}
            </h2>
            {getDifficultyBadge(selectedProblem.difficulty)}
            {isSolved(selectedProblem._id) && (
              <span className="solved-checkmark-badge" title="Solved successfully">
                <Icon.Check /> Solved
              </span>
            )}
          </div>
        </div>

        {/* Resizable Split Pane */}
        <div className="coding-split-pane" ref={splitPaneRef}>
          {/* Left Panel: Description */}
          <div className="coding-pane-left" style={{ width: `${leftWidth}%` }}>
            <div className="pane-left-content">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {selectedProblem.tags?.map((tag, tIdx) => (
                  <span key={tIdx} className="tag-chip">{tag}</span>
                ))}
              </div>

              <div className="problem-description-body">
                <p style={{ whiteSpace: "pre-line" }}>{selectedProblem.description}</p>
              </div>

              {selectedProblem.constraints && (
                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Constraints:</h4>
                  <ul className="constraints-list">
                    {selectedProblem.constraints.split("\n").map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProblem.sampleInput && (
                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Input:</h4>
                  <pre className="io-sample-block">{selectedProblem.sampleInput}</pre>
                </div>
              )}

              {selectedProblem.sampleOutput && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "8px" }}>Sample Output:</h4>
                  <pre className="io-sample-block">{selectedProblem.sampleOutput}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Resizing Handle */}
          <div className="coding-pane-resizer" onMouseDown={handleMouseDown} />

          {/* Right Panel: Editor & Tabs */}
          <div className="coding-pane-right" style={{ width: `${100 - leftWidth}%` }}>
            <div className="pane-right-content">
              {/* Tabs Switcher */}
              <div className="workspace-tabs-bar">
                <button
                  className={`workspace-tab-btn ${activeTab === "code" ? "active" : ""}`}
                  onClick={() => setActiveTab("code")}
                >
                  Code Editor
                </button>
                <button
                  className={`workspace-tab-btn ${activeTab === "submissions" ? "active" : ""}`}
                  onClick={() => setActiveTab("submissions")}
                >
                  Submissions ({problemSubmissions.length})
                </button>
              </div>

              {activeTab === "code" ? (
                <div className="workspace-editor-section">
                  {/* Options Bar */}
                  <div className="editor-options-bar">
                    <div className="editor-lang-picker">
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Language:</span>
                      <select className="editor-lang-select" defaultValue="javascript">
                        <option value="javascript">JavaScript (Node.js)</option>
                      </select>
                    </div>
                    <button
                      className="reset-editor-btn"
                      onClick={handleResetCode}
                      title="Reset code to boilerplate"
                    >
                      <Icon.Refresh />
                    </button>
                  </div>

                  {/* Monaco Editor Canvas */}
                  <div className="editor-canvas-container">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={editorCode}
                      onChange={handleCodeChange}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        scrollbar: { vertical: "visible", horizontal: "visible" },
                        lineNumbersMinChars: 3,
                        tabSize: 4
                      }}
                    />
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="editor-actions-bar">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Button
                        variant="outline"
                        style={{ width: "auto" }}
                        onClick={handleRunTests}
                        disabled={submitting}
                      >
                        <Icon.Play /> Run Tests
                      </Button>
                      <Button
                        variant="default"
                        style={{ width: "auto", background: "#D97706", borderColor: "#D97706", color: "#171717" }}
                        onClick={handleSubmitCode}
                        disabled={submitting}
                      >
                        <Icon.Submit /> {submitting ? "Submitting..." : "Submit Code"}
                      </Button>
                    </div>
                  </div>

                  {/* FLAT SLIDE-IN VERDICT BANNER (NOT GLASSMORPHIC) */}
                  {verdict && (
                    <div className={`verdict-flat-banner ${verdict.submission.verdict === "Accepted" ? "accepted" : "failed"}`}>
                      <div className="banner-header-row">
                        <span className="banner-verdict-title">
                          {verdict.message === "Dry run evaluated" && <span style={{ fontSize: "14px", color: "#9CA3AF", marginRight: "8px" }}>[Dry Run]</span>}
                          {verdict.submission.verdict === "Accepted" ? "Accepted" : verdict.submission.verdict}
                        </span>
                        <span className="banner-verdict-ratio">
                          Passed {verdict.passedCount} / {verdict.totalCount} Test Cases
                        </span>
                      </div>

                      {/* Stat chips */}
                      <div className="banner-metrics-row">
                        <div className="metric-chip">
                          <span className="lbl">Time:</span>
                          <span className="val">{verdict.submission.executionTime} ms</span>
                        </div>
                        <div className="metric-chip">
                          <span className="lbl">Memory:</span>
                          <span className="val">{verdict.submission.memoryUsed} KB</span>
                        </div>
                        <div className="metric-chip">
                          <span className="lbl">Score:</span>
                          <span className="val">{verdict.submission.score} / 100</span>
                        </div>
                      </div>

                      {/* Failed details */}
                      {verdict.failedTestCaseDetails && (
                        <div className="banner-details-wrapper">
                          <button
                            className="toggle-details-btn"
                            onClick={() => setShowFailedDetails(!showFailedDetails)}
                          >
                            <span>Failing Test Case Context ({verdict.failedTestCaseDetails.error ? "Execution Error" : "Incorrect Output"})</span>
                            <span style={{ transform: showFailedDetails ? "rotate(180deg)" : "rotate(0deg)", display: "inline-flex", transition: "transform 0.2s" }}>
                              <Icon.ChevronDown />
                            </span>
                          </button>

                          {showFailedDetails && (
                            <div className="failed-details-block">
                              <div className="detail-item">
                                <span className="lbl">Failing Test Case #:</span>
                                <span className="val val-mono">{verdict.failedTestCaseDetails.testCaseIndex}</span>
                              </div>
                              <div className="detail-item">
                                <span className="lbl">Input:</span>
                                <pre className="val-block">{verdict.failedTestCaseDetails.input}</pre>
                              </div>
                              {verdict.failedTestCaseDetails.error ? (
                                <div className="detail-item">
                                  <span className="lbl" style={{ color: "#EF4444" }}>Runtime Error:</span>
                                  <pre className="val-block error-block">{verdict.failedTestCaseDetails.error}</pre>
                                </div>
                              ) : (
                                <>
                                  <div className="detail-item">
                                    <span className="lbl">Expected Output:</span>
                                    <pre className="val-block expected-block">{verdict.failedTestCaseDetails.expectedOutput}</pre>
                                  </div>
                                  <div className="detail-item">
                                    <span className="lbl">Your Output:</span>
                                    <pre className="val-block actual-block">{verdict.failedTestCaseDetails.actualOutput}</pre>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="workspace-submissions-section">
                  {problemSubmissions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 16px", color: "#9CA3AF" }}>
                      You have not submitted any solutions for this question yet.
                    </div>
                  ) : (
                    <div className="submissions-table-wrapper">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{ width: "30%" }}>Verdict</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Runtime</TableHead>
                            <TableHead>Memory</TableHead>
                            <TableHead style={{ width: "30%" }}>Submitted At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {problemSubmissions.map((sub) => {
                            let badgeClass = "badge-tle";
                            if (sub.verdict === "Accepted") badgeClass = "badge-accepted";
                            else if (sub.verdict === "Wrong Answer" || sub.verdict === "Runtime Error") badgeClass = "badge-wa";

                            return (
                              <TableRow key={sub._id}>
                                <TableCell>
                                  <span className={`submission-status-pill ${badgeClass}`}>
                                    {sub.verdict}
                                  </span>
                                </TableCell>
                                <TableCell style={{ fontWeight: 600 }}>{sub.score}/100</TableCell>
                                <TableCell>{sub.executionTime} ms</TableCell>
                                <TableCell>{sub.memoryUsed} KB</TableCell>
                                <TableCell style={{ color: "#9CA3AF", fontSize: "13px" }}>
                                  {new Date(sub.submittedAt).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW (NO PROBLEM SELECTED)
  return (
    <div className="mcq-container">
      {errorMsg && (
        <Card style={{ borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)", marginBottom: "20px" }}>
          <CardContent style={{ padding: "16px", color: "#EF4444" }}>{errorMsg}</CardContent>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontFamily: "Space Grotesk", color: "#EDEDED", fontWeight: 500 }}>
            Coding Sandbox & Assessments
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: "14px", marginTop: "4px" }}>
            Select a problem challenge below to open the sandboxed code environment.
          </p>
        </div>
      </div>

      {problems.length === 0 ? (
        <Card>
          <CardContent style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
            No coding questions have been published on the platform yet.
          </CardContent>
        </Card>
      ) : (
        <div className="coding-problems-list">
          {problems.map((prob) => {
            const solved = isSolved(prob._id);
            return (
              <div
                key={prob._id}
                className={`problem-row-card ${solved ? "solved-card" : ""}`}
                onClick={() => handleOpenProblem(prob)}
              >
                <div className="problem-row-left">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {solved && (
                      <span className="row-checkmark-icon" title="Problem Solved">
                        <Icon.Check />
                      </span>
                    )}
                    <h3 className="problem-row-title">{prob.title}</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {prob.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="problem-row-right">
                  {getDifficultyBadge(prob.difficulty)}
                  <span className="arrow-indicator">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
