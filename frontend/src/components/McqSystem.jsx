import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { Progress } from "./ui/progress";

// Icons Helper (matching Dashboard.jsx style)
const Icon = {
  Clock: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
};


// CANDIDATE VIEW

export function MCQTestCandidateView({ user, navigateToDashboard }) {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Test Taking State
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Review States
  const [reviewResult, setReviewResult] = useState(null); // Result immediately after submit
  const [pastReviewTest, setPastReviewTest] = useState(null);
  const [pastReviewQuestions, setPastReviewQuestions] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchTestsAndAttempts();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchTestsAndAttempts = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);

      const [testsRes, attemptsRes] = await Promise.all([
        fetch("/api/tests", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/tests/my-attempts", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (testsRes.ok && attemptsRes.ok) {
        const testsData = await testsRes.json();
        const attemptsData = await attemptsRes.json();
        setTests(testsData.tests);
        setAttempts(attemptsData.attempts);
      } else {
        setErrorMessage("Failed to load test details from the server.");
      }
    } catch (err) {
      setErrorMessage("Error connecting to server. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  // Start Test session
  const startTest = async (test) => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(`/api/tests/${test._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setActiveTest(data.test);
        setQuestions(data.questions);
        setCurrentIdx(0);
        setAnswers({});
        setTimeLeft(data.test.duration * 60);

        // Start timer
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              // Auto submit
              autoSubmit(data.test._id, data.questions);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrorMessage(data.message || "Failed to retrieve questions.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to server to start test.");
    } finally {
      setLoading(false);
    }
  };

  // Format Time Helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getTimerClass = (seconds) => {
    if (seconds < 60) return "mcq-timer danger";
    if (seconds < 180) return "mcq-timer warning";
    return "mcq-timer";
  };

  // Submit test manual
  const submitTest = async () => {
    if (!window.confirm("Are you sure you want to submit your answers and end the test?")) {
      return;
    }
    await executeSubmission(activeTest._id, questions);
  };

  // Auto-submit when timer runs out
  const autoSubmit = async (tId, qList) => {
    alert("Time is up! Your answers are being submitted automatically.");
    await executeSubmission(tId, qList);
  };

  const executeSubmission = async (tId, qList) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const token = localStorage.getItem("intervux_token");
      // Map state answers to array
      const answerPayload = qList.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] || ""
      }));

      const res = await fetch(`/api/tests/${tId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answerPayload })
      });
      const data = await res.json();

      if (res.ok) {
        setReviewResult(data);
        setActiveTest(null);
        setQuestions([]);
        fetchTestsAndAttempts();
      } else {
        setErrorMessage(data.message || "Failed to submit test attempt.");
        setActiveTest(null);
      }
    } catch (err) {
      setErrorMessage("Connection lost. Failed to submit test.");
      setActiveTest(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Review a past test attempt
  const reviewAttempt = async (attempt) => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(`/api/tests/${attempt.testId._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setPastReviewTest(attempt);
        // Note: For past reviews, since database doesn't store exact selected options,
        // we can show correct answers and explanations for review, which is extremely useful.
        setPastReviewQuestions(data.questions);
      } else {
        setErrorMessage("Could not load review questions.");
      }
    } catch (err) {
      setErrorMessage("Error retrieving test questions for review.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !activeTest) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  // ACTIVE TEST MODE UI
  if (activeTest) {
    const currentQ = questions[currentIdx];
    const progressPercent = questions.length ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

    return (
      <div className="mcq-container">
        <div className="mcq-session-header">
          <div>
            <Badge variant="amber" style={{ marginBottom: "6px" }}>{activeTest.category}</Badge>
            <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk", color: "#EDEDED", fontWeight: 500 }}>
              {activeTest.title}
            </h2>
          </div>
          <div className={getTimerClass(timeLeft)}>
            <Icon.Clock />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Card style={{ backgroundColor: "#212121", borderColor: "#333333" }}>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>1 Mark</span>
            </div>
            <Progress value={progressPercent} style={{ height: "6px" }} />
            <CardTitle style={{ fontSize: "18px", fontFamily: "Inter", fontWeight: 500, color: "#EDEDED", marginTop: "16px", lineHeight: "1.5" }}>
              {currentQ?.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="choice-cards-container">
              {currentQ?.options.map((option, idx) => {
                const letters = ["A", "B", "C", "D"];
                const isSelected = answers[currentQ._id] === option;
                return (
                  <button
                    key={idx}
                    className={`choice-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ._id]: option }))}
                  >
                    <span className="choice-indicator">{letters[idx]}</span>
                    <span className="choice-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="mcq-nav-footer">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              style={{ width: "auto" }}
            >
              Previous
            </Button>
            {currentIdx < questions.length - 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentIdx(prev => prev + 1)}
                style={{ width: "auto" }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={submitTest}
                disabled={submitting}
                style={{ width: "auto", background: "#D97706", borderColor: "#D97706", color: "#171717" }}
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // REVIEW IMMEDIATE SUBMISSION RESULT UI
  if (reviewResult) {
    const scorePct = reviewResult.attempt.totalQuestions
      ? Math.round((reviewResult.attempt.score / reviewResult.attempt.totalQuestions) * 100)
      : 0;

    return (
      <div className="mcq-container">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="outline" onClick={() => setReviewResult(null)} style={{ width: "auto", padding: "8px 12px" }}>
            <Icon.ArrowLeft /> Back to Tests
          </Button>
          <h2 style={{ fontSize: "22px", fontFamily: "Space Grotesk" }}>Test Submission Report</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
          {/* Summary Card */}
          <Card style={{ backgroundColor: "#212121", borderColor: "#333333" }}>
            <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: "20px" }}>
              <div className="result-score-ring-container">
                <div className={`result-score-badge ${reviewResult.passed ? "passed" : "failed"}`}>
                  <span style={{ fontSize: "28px" }}>{reviewResult.attempt.score}</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {reviewResult.attempt.totalQuestions}</span>
                </div>
                <Badge variant={reviewResult.passed ? "teal" : "coral"} style={{ fontSize: "14px", padding: "4px 12px", marginTop: "12px" }}>
                  {reviewResult.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "8px" }}>JavaScript MCQ Assessment</h3>
                <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                  You scored <strong>{scorePct}%</strong>. The passing criteria for this test is to obtain at least{" "}
                  <strong>{reviewResult.attempt.score >= reviewResult.passed ? "the passing marks" : "passing score"}</strong>.
                </p>
              </div>

              <div style={{ display: "flex", gap: "24px", width: "100%", maxWidth: "360px", margin: "16px auto 0" }}>
                <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #333333" }}>
                  <div style={{ color: "#10B981", fontSize: "18px", fontWeight: 600 }}>{reviewResult.attempt.correctAnswers}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Correct</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#EF4444", fontSize: "18px", fontWeight: 600 }}>{reviewResult.attempt.wrongAnswers}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Wrong / Skip</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Review */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Answers Review</CardTitle>
              <CardDescription>Review all questions with explanations.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {reviewResult.results.map((res, qIdx) => (
                <div key={res.questionId} className="review-question-item">
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: 600, color: "#D97706", fontSize: "14px", marginTop: "2px" }}>Q{qIdx + 1}.</span>
                    <p style={{ fontWeight: 500, fontSize: "15px", lineHeight: "1.5" }}>{res.question}</p>
                  </div>

                  <div className="review-options">
                    {res.options.map((opt, oIdx) => {
                      const isCorrectAnswer = opt === res.correctAnswer;
                      const isSelectedAnswer = opt === res.selectedOption;
                      let optionClass = "review-option-card";
                      let indicator = null;

                      if (isCorrectAnswer) {
                        optionClass += " correct";
                        indicator = <span style={{ color: "#10B981", display: "inline-flex" }}><Icon.Check /></span>;
                      } else if (isSelectedAnswer && !isCorrectAnswer) {
                        optionClass += " incorrect";
                        indicator = <span style={{ color: "#EF4444", display: "inline-flex" }}><Icon.X /></span>;
                      }

                      return (
                        <div key={oIdx} className={optionClass}>
                          <span style={{ fontWeight: 600, marginRight: "4px" }}>
                            {["A", "B", "C", "D"][oIdx]}.
                          </span>
                          <span style={{ flex: 1 }}>{opt}</span>
                          {indicator}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ backgroundColor: "#1A1A1A", padding: "12px 16px", borderRadius: "6px", borderLeft: "3px solid #D97706", marginTop: "12px", fontSize: "13px" }}>
                    <strong style={{ color: "#D97706", display: "block", marginBottom: "4px" }}>Explanation:</strong>
                    <span style={{ color: "#EDEDED" }}>{res.explanation || "No explanation provided."}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // REVIEW PAST TEST ATTEMPT UI
  if (pastReviewTest) {
    const scorePct = pastReviewTest.testId?.totalMarks
      ? Math.round((pastReviewTest.score / pastReviewTest.testId.totalMarks) * 100)
      : 0;

    return (
      <div className="mcq-container">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="outline" onClick={() => setPastReviewTest(null)} style={{ width: "auto", padding: "8px 12px" }}>
            <Icon.ArrowLeft /> Back to Tests
          </Button>
          <h2 style={{ fontSize: "22px", fontFamily: "Space Grotesk" }}>Attempt Review</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
          {/* Summary Card */}
          <Card style={{ backgroundColor: "#212121", borderColor: "#333333" }}>
            <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", gap: "16px" }}>
              <div className="result-score-ring-container">
                <div className={`result-score-badge ${pastReviewTest.score >= (pastReviewTest.testId?.passingMarks || 0) ? "passed" : "failed"}`}>
                  <span style={{ fontSize: "28px" }}>{pastReviewTest.score}</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {pastReviewTest.testId?.totalMarks || 0}</span>
                </div>
                <Badge variant={pastReviewTest.score >= (pastReviewTest.testId?.passingMarks || 0) ? "teal" : "coral"} style={{ fontSize: "14px", padding: "4px 12px", marginTop: "12px" }}>
                  {pastReviewTest.score >= (pastReviewTest.testId?.passingMarks || 0) ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "4px" }}>{pastReviewTest.testId?.title}</h3>
                <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
                  Attempt submitted on {new Date(pastReviewTest.submittedAt).toLocaleDateString()} at {new Date(pastReviewTest.submittedAt).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Review */}
          <Card>
            <CardHeader>
              <CardTitle>Questions Reference Key</CardTitle>
              <CardDescription>View correct solutions and explanations for study reference.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {pastReviewQuestions.map((q, qIdx) => (
                <div key={q._id} className="review-question-item">
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: 600, color: "#D97706", fontSize: "14px", marginTop: "2px" }}>Q{qIdx + 1}.</span>
                    <p style={{ fontWeight: 500, fontSize: "15px", lineHeight: "1.5" }}>{q.question}</p>
                  </div>

                  <div className="review-options">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectAnswer = opt === q.correctAnswer;
                      let optionClass = "review-option-card";
                      let indicator = null;

                      if (isCorrectAnswer) {
                        optionClass += " correct";
                        indicator = <span style={{ color: "#10B981", display: "inline-flex" }}><Icon.Check /></span>;
                      }

                      return (
                        <div key={oIdx} className={optionClass}>
                          <span style={{ fontWeight: 600, marginRight: "4px" }}>
                            {["A", "B", "C", "D"][oIdx]}.
                          </span>
                          <span style={{ flex: 1 }}>{opt}</span>
                          {indicator}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ backgroundColor: "#1A1A1A", padding: "12px 16px", borderRadius: "6px", borderLeft: "3px solid #D97706", marginTop: "12px", fontSize: "13px" }}>
                    <strong style={{ color: "#D97706", display: "block", marginBottom: "4px" }}>Explanation:</strong>
                    <span style={{ color: "#EDEDED" }}>{q.explanation || "No explanation provided."}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // AVAILABLE TESTS LIST & PAST ATTEMPTS LIST
  return (
    <div className="mcq-container">
      {errorMessage && (
        <Card style={{ borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <CardContent style={{ padding: "16px", color: "#EF4444" }}>{errorMessage}</CardContent>
        </Card>
      )}

      {/* Available MCQ Tests */}
      <div>
        <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk", marginBottom: "16px" }}>Available MCQ Assessments</h2>
        {tests.length === 0 ? (
          <Card>
            <CardContent style={{ padding: "32px", textAlign: "center", color: "#9CA3AF" }}>
              No active MCQ tests are currently assigned to you.
            </CardContent>
          </Card>
        ) : (
          <div className="mcq-test-grid">
            {tests.map((test) => (
              <Card key={test._id} style={{ display: "flex", flexDirection: "column" }}>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <Badge variant="teal">{test.category}</Badge>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{test.duration} Mins</span>
                  </div>
                  <CardTitle style={{ fontSize: "16px", fontWeight: 600 }}>{test.title}</CardTitle>
                  <CardDescription style={{ fontSize: "13px", height: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {test.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#EDEDED" }}>
                    <span>Questions: <strong>{test.totalMarks}</strong></span>
                    <span>Passing Marks: <strong>{test.passingMarks}</strong></span>
                  </div>
                </CardContent>
                <CardFooter style={{ paddingTop: 0 }}>
                  <Button
                    onClick={() => startTest(test)}
                    disabled={test.totalMarks === 0}
                    style={{ background: "#D97706", borderColor: "#D97706", color: "#171717" }}
                  >
                    {test.totalMarks === 0 ? "Under Setup" : "Start Test"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator style={{ margin: "24px 0" }} />

      {/* Previous Test Attempts */}
      <div>
        <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk", marginBottom: "16px" }}>My Test History</h2>
        {attempts.length === 0 ? (
          <Card>
            <CardContent style={{ padding: "32px", textAlign: "center", color: "#9CA3AF" }}>
              You have not attempted any tests yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent style={{ padding: 0 }}>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => {
                      const scorePct = attempt.totalQuestions ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
                      const isPassed = attempt.score >= (attempt.testId?.passingMarks || 0);

                      return (
                        <TableRow key={attempt._id}>
                          <TableCell style={{ fontWeight: 500 }}>{attempt.testId?.title || "Deleted Test"}</TableCell>
                          <TableCell>{attempt.testId?.category || "N/A"}</TableCell>
                          <TableCell>{attempt.score} / {attempt.totalQuestions}</TableCell>
                          <TableCell>{scorePct}%</TableCell>
                          <TableCell>{new Date(attempt.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={isPassed ? "teal" : "coral"}>
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => reviewAttempt(attempt)}
                              disabled={!attempt.testId}
                              style={{ width: "auto", fontSize: "12px", padding: "4px 8px" }}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ADMIN VIEW

export function MCQTestAdminView({ user, navigateToDashboard }) {
  const [activeTab, setActiveTab] = useState("tests"); // "tests" | "attempts"
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Manage Question Mode
  const [manageQuestionsTest, setManageQuestionsTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [subject, setSubject] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Create Test Mode
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    category: "Technical",
    duration: 15,
    passingMarks: 5,
    isActive: true
  });
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);

      if (activeTab === "tests") {
        const res = await fetch("/api/tests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setTests(data.tests);
        else setErrorMessage(data.message || "Failed to load tests.");
      } else {
        const res = await fetch("/api/tests/all-attempts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setAttempts(data.attempts);
        else setErrorMessage(data.message || "Failed to load attempts.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTest.title || !newTest.category) {
      alert("Title and Category are required!");
      return;
    }

    setCreatingTest(true);
    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTest)
      });
      const data = await res.json();

      if (res.ok) {
        setShowCreateForm(false);
        setNewTest({
          title: "",
          description: "",
          category: "Technical",
          duration: 15,
          passingMarks: 5,
          isActive: true
        });
        fetchAdminData();
      } else {
        alert(data.message || "Failed to create test");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setCreatingTest(false);
    }
  };

  // Open question manager for test
  const openManageQuestions = async (test) => {
    try {
      const token = localStorage.getItem("intervux_token");
      setLoading(true);
      const res = await fetch(`/api/tests/${test._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setManageQuestionsTest(test);
        setQuestions(data.questions);
        // Reset form
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setExplanation("");
        setSubject(test.category);
        setDifficulty("medium");
      } else {
        alert(data.message || "Failed to fetch test questions.");
      }
    } catch (err) {
      alert("Error retrieving test details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText || options.some(opt => !opt) || !correctAnswer || !subject) {
      alert("All fields are required to add a question!");
      return;
    }
    if (!options.includes(correctAnswer)) {
      alert("Correct Answer must match one of the 4 options exactly!");
      return;
    }

    setAddingQuestion(true);
    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch(`/api/tests/${manageQuestionsTest._id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: questionText,
          options,
          correctAnswer,
          explanation,
          difficulty,
          subject
        })
      });
      const data = await res.json();

      if (res.ok) {
        // Refresh question list
        setQuestions([...questions, data.question]);
        // Update list metrics
        setTests(tests.map(t => t._id === manageQuestionsTest._id ? data.test : t));
        // Reset form inputs except subject/difficulty
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setExplanation("");
      } else {
        alert(data.message || "Failed to add question.");
      }
    } catch (err) {
      alert("Error adding question to test.");
    } finally {
      setAddingQuestion(false);
    }
  };

  if (loading && !manageQuestionsTest) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  // MANAGE QUESTIONS DETAILS VIEW UI
  if (manageQuestionsTest) {
    return (
      <div className="mcq-container">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="outline" onClick={() => setManageQuestionsTest(null)} style={{ width: "auto", padding: "8px 12px" }}>
            <Icon.ArrowLeft /> Back to Tests
          </Button>
          <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk" }}>
            Manage Questions - {manageQuestionsTest.title}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
          {/* Add Question Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Configure question details, options and explanation.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddQuestion}>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Question Text</label>
                  <Input
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g., What is the output of 2 + '2' in JS?"
                  />
                </div>

                <div className="mcq-form-grid">
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Option A</label>
                    <Input
                      value={options[0]}
                      onChange={(e) => setOptions([e.target.value, options[1], options[2], options[3]])}
                      placeholder="Choice A text"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Option B</label>
                    <Input
                      value={options[1]}
                      onChange={(e) => setOptions([options[0], e.target.value, options[2], options[3]])}
                      placeholder="Choice B text"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Option C</label>
                    <Input
                      value={options[2]}
                      onChange={(e) => setOptions([options[0], options[1], e.target.value, options[3]])}
                      placeholder="Choice C text"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Option D</label>
                    <Input
                      value={options[3]}
                      onChange={(e) => setOptions([options[0], options[1], options[2], e.target.value])}
                      placeholder="Choice D text"
                    />
                  </div>
                </div>

                <div className="mcq-form-grid">
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Correct Answer Option</label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      style={{ width: "100%", height: "42px", backgroundColor: "#1A1A1A", border: "1px solid #333333", color: "#EDEDED", borderRadius: "6px", padding: "0 12px" }}
                    >
                      <option value="">-- Select Correct Option --</option>
                      {options.filter(opt => opt).map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Subject / Tag</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. JS Closures"
                    />
                  </div>
                </div>

                <div className="mcq-form-grid">
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{ width: "100%", height: "42px", backgroundColor: "#1A1A1A", border: "1px solid #333333", color: "#EDEDED", borderRadius: "6px", padding: "0 12px" }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Explanation</label>
                    <Input
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Correct answer explanation context"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={addingQuestion} style={{ background: "#D97706", borderColor: "#D97706", color: "#171717" }}>
                  {addingQuestion ? "Adding..." : "Add Question"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {questions.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9CA3AF", padding: "16px" }}>No questions added to this test yet.</div>
              ) : (
                questions.map((q, qIdx) => (
                  <div key={q._id} className="review-question-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, color: "#D97706" }}>Q{qIdx + 1}.</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span className={`meta-tag difficulty-${q.difficulty}`}>{q.difficulty}</span>
                        <span className="meta-tag">{q.subject}</span>
                      </div>
                    </div>
                    <p style={{ fontWeight: 500, marginBottom: "12px", lineHeight: "1.5" }}>{q.question}</p>

                    <div className="review-options">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div key={oIdx} className={`review-option-card ${isCorrect ? "correct" : ""}`}>
                            <span style={{ fontWeight: 600 }}>{["A", "B", "C", "D"][oIdx]}.</span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isCorrect && <span style={{ color: "#10B981", display: "inline-flex" }}><Icon.Check /></span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div style={{ fontSize: "12px", color: "#9CA3AF", backgroundColor: "#1A1A1A", padding: "8px 12px", borderRadius: "4px", borderLeft: "2px solid #D97706", marginTop: "8px" }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // LIST VIEWS (TESTS / ATTEMPTS) UI
  return (
    <div className="mcq-container">
      {errorMessage && (
        <Card style={{ borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <CardContent style={{ padding: "16px", color: "#EF4444" }}>{errorMessage}</CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #333333", paddingBottom: "12px" }}>
        <Button
          variant={activeTab === "tests" ? "default" : "outline"}
          onClick={() => { setActiveTab("tests"); setShowCreateForm(false); }}
          style={{ width: "auto" }}
        >
          MCQ Tests List
        </Button>
        <Button
          variant={activeTab === "attempts" ? "default" : "outline"}
          onClick={() => { setActiveTab("attempts"); setShowCreateForm(false); }}
          style={{ width: "auto" }}
        >
          Platform Attempts
        </Button>
      </div>

      {activeTab === "tests" && (
        <>
          {/* Create Test Button & Toggle Form */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ width: "auto", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {showCreateForm ? <Icon.X /> : <Icon.Plus />}
              {showCreateForm ? "Close Form" : "Create MCQ Test"}
            </Button>
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New MCQ Test</CardTitle>
                <CardDescription>Setup the base constraints of the test.</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateTest}>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Test Title</label>
                    <Input
                      value={newTest.title}
                      onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                      placeholder="e.g. JavaScript Closures Quiz"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Description</label>
                    <Input
                      value={newTest.description}
                      onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                      placeholder="e.g. Test candidate knowledge on JS closure scopes and execution stacks"
                    />
                  </div>

                  <div className="mcq-form-grid">
                    <div>
                      <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Category</label>
                      <Input
                        value={newTest.category}
                        onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                        placeholder="e.g. Technical, Analytical"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Duration (Minutes)</label>
                      <Input
                        type="number"
                        value={newTest.duration}
                        onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) || 0 })}
                        placeholder="Duration in minutes"
                      />
                    </div>
                  </div>

                  <div className="mcq-form-grid">
                    <div>
                      <label style={{ fontSize: "13px", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>Passing Marks</label>
                      <Input
                        type="number"
                        value={newTest.passingMarks}
                        onChange={(e) => setNewTest({ ...newTest, passingMarks: parseInt(e.target.value) || 0 })}
                        placeholder="Required score to pass"
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "42px", marginTop: "24px" }}>
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newTest.isActive}
                        onChange={(e) => setNewTest({ ...newTest, isActive: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "#D97706" }}
                      />
                      <label htmlFor="isActive" style={{ fontSize: "14px", color: "#EDEDED", cursor: "pointer" }}>Is Active (Visible to Candidates)</label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={creatingTest} style={{ background: "#D97706", borderColor: "#D97706", color: "#171717" }}>
                    {creatingTest ? "Creating..." : "Create Test"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Test Lists Table */}
          <Card>
            <CardContent style={{ padding: 0 }}>
              {tests.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF" }}>No MCQ Tests created yet.</div>
              ) : (
                <div className="table-responsive">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Total Questions</TableHead>
                        <TableHead>Passing Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test) => (
                        <TableRow key={test._id}>
                          <TableCell style={{ fontWeight: 500 }}>{test.title}</TableCell>
                          <TableCell>{test.category}</TableCell>
                          <TableCell>{test.duration} Mins</TableCell>
                          <TableCell>{test.totalMarks}</TableCell>
                          <TableCell>{test.passingMarks}</TableCell>
                          <TableCell>
                            <Badge variant={test.isActive ? "teal" : "default"}>
                              {test.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => openManageQuestions(test)}
                              style={{ width: "auto", fontSize: "12px", padding: "4px 8px" }}
                            >
                              Manage Questions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "attempts" && (
        <Card>
          <CardContent style={{ padding: 0 }}>
            {attempts.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF" }}>No candidate attempts registered on the platform.</div>
            ) : (
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Test Title</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => {
                      const scorePct = attempt.totalQuestions ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
                      const isPassed = attempt.score >= (attempt.testId?.passingMarks || 0);

                      return (
                        <TableRow key={attempt._id}>
                          <TableCell style={{ fontWeight: 500 }}>{attempt.candidateId?.name || "N/A"}</TableCell>
                          <TableCell>{attempt.candidateId?.email || "N/A"}</TableCell>
                          <TableCell>{attempt.testId?.title || "Deleted Test"}</TableCell>
                          <TableCell>{attempt.score} / {attempt.totalQuestions}</TableCell>
                          <TableCell>{scorePct}%</TableCell>
                          <TableCell>{new Date(attempt.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={isPassed ? "teal" : "coral"}>
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
