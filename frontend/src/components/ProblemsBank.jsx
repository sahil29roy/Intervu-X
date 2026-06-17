import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function ProblemsBank({ user, initialViewingProblem }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // View state
  const [viewingProblem, setViewingProblem] = useState(initialViewingProblem || null);

  useEffect(() => {
    if (initialViewingProblem) {
      setViewingProblem(initialViewingProblem);
    }
  }, [initialViewingProblem]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem("intervux_token");
      const res = await fetch("/api/coding/questions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProblems(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to fetch problems:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case "easy": return "#22C55E";
      case "medium": return "#D97706";
      case "hard": return "#EF4444";
      default: return "#9CA3AF";
    }
  };

  // ── VIEW PROBLEM MODAL / PAGE ──
  if (viewingProblem) {
    const p = viewingProblem;
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Button variant="ghost" onClick={() => setViewingProblem(null)} style={{ padding: "0", color: "#9CA3AF" }}>
            ← Back to Problems Bank
          </Button>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px", color: "#EDEDED" }}>{p.title}</h2>
            <Badge style={{ backgroundColor: `rgba(${getDifficultyColor(p.difficulty).replace('#', '')}, 0.15)`, color: getDifficultyColor(p.difficulty), border: `1px solid ${getDifficultyColor(p.difficulty)}` }}>
              {p.difficulty.toUpperCase()}
            </Badge>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="outline" onClick={() => alert("Edit feature coming soon!")}>Edit Problem</Button>
          </div>
        </div>

        <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", marginBottom: "24px" }}>
          <CardHeader style={{ borderBottom: "1px solid #262626", paddingBottom: "16px" }}>
            <CardTitle style={{ fontSize: "18px" }}>Problem Description</CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: "24px", color: "#D1D5DB", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
            {p.description}
          </CardContent>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
            <CardHeader style={{ borderBottom: "1px solid #262626" }}>
              <CardTitle style={{ fontSize: "16px" }}>Sample Cases</CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: "16px" }}>
              {p.sampleInput ? (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "#EDEDED", display: "block", marginBottom: "4px" }}>Input:</strong>
                    <pre style={{ backgroundColor: "#121212", padding: "12px", borderRadius: "6px", color: "#D1D5DB", fontSize: "13px" }}>{p.sampleInput}</pre>
                  </div>
                  <div>
                    <strong style={{ color: "#EDEDED", display: "block", marginBottom: "4px" }}>Output:</strong>
                    <pre style={{ backgroundColor: "#121212", padding: "12px", borderRadius: "6px", color: "#D1D5DB", fontSize: "13px" }}>{p.sampleOutput}</pre>
                  </div>
                </>
              ) : (
                <p style={{ color: "#6B7280", fontStyle: "italic" }}>No sample cases provided.</p>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
            <CardHeader style={{ borderBottom: "1px solid #262626" }}>
              <CardTitle style={{ fontSize: "16px" }}>Hidden Test Cases ({p.hiddenTestCases?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: "16px", maxHeight: "300px", overflowY: "auto" }}>
              {p.hiddenTestCases && p.hiddenTestCases.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {p.hiddenTestCases.map((tc, idx) => (
                    <div key={idx} style={{ backgroundColor: "#262626", padding: "12px", borderRadius: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px", display: "block" }}>Test Case {idx + 1}</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <strong style={{ color: "#EDEDED", fontSize: "12px", display: "block", marginBottom: "4px" }}>Input:</strong>
                          <pre style={{ backgroundColor: "#121212", padding: "8px", borderRadius: "4px", color: "#D1D5DB", fontSize: "12px", margin: 0 }}>{tc.input}</pre>
                        </div>
                        <div>
                          <strong style={{ color: "#EDEDED", fontSize: "12px", display: "block", marginBottom: "4px" }}>Expected:</strong>
                          <pre style={{ backgroundColor: "#121212", padding: "8px", borderRadius: "4px", color: "#D1D5DB", fontSize: "12px", margin: 0 }}>{tc.output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6B7280", fontStyle: "italic" }}>No hidden test cases provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Starter Code (if implemented on model, currently doesn't exist on CodingQuestion model but adding support if it gets added) */}
        {p.starterCode && (
          <Card style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}>
            <CardHeader style={{ borderBottom: "1px solid #262626" }}>
              <CardTitle style={{ fontSize: "16px" }}>Starter Code</CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: "16px" }}>
              <pre style={{ backgroundColor: "#121212", padding: "16px", borderRadius: "8px", color: "#D1D5DB", fontSize: "13px", overflowX: "auto" }}>
                {p.starterCode}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── MAIN BANK VIEW ──
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "28px", fontFamily: "'Space Grotesk', sans-serif" }}>Problems Bank</h2>
        <Button onClick={() => alert("Create Problem feature coming soon!")} style={{ backgroundColor: "#D97706", color: "#171717" }}>
          Create Problem
        </Button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center" }}>
        <input 
          type="text"
          placeholder="Search Problem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, maxWidth: "400px", padding: "10px 16px", borderRadius: "8px", backgroundColor: "#1e1e1e", border: "1px solid #333", color: "#EDEDED", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "8px", backgroundColor: "#1e1e1e", padding: "4px", borderRadius: "8px", border: "1px solid #333" }}>
          {["All", "Easy", "Medium", "Hard"].map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                backgroundColor: difficultyFilter === diff ? "#262626" : "transparent",
                color: difficultyFilter === diff ? "#EDEDED" : "#9CA3AF",
                border: "none",
                cursor: "pointer",
                fontWeight: difficultyFilter === diff ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", color: "#9CA3AF", textAlign: "center" }}>Loading problems...</div>
      ) : filteredProblems.length === 0 ? (
        <Card style={{ backgroundColor: "#1e1e1e", border: "1px dashed #333", padding: "64px 24px", textAlign: "center" }}>
          <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.8 }}>&lt;/&gt;</div>
            <h3 style={{ fontSize: "20px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "8px", color: "#EDEDED" }}>
              No coding problems available.
            </h3>
            <p style={{ color: "#9CA3AF", fontSize: "14px", maxWidth: "400px", margin: "0 auto", marginBottom: "24px" }}>
              Create your first coding problem to start conducting technical interviews.
            </p>
            <Button onClick={() => alert("Create Problem feature coming soon!")} style={{ backgroundColor: "#D97706", color: "#171717" }}>
              Create Problem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filteredProblems.map(p => (
            <Card key={p._id} style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", display: "flex", flexDirection: "column" }}>
              <CardHeader style={{ paddingBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <CardTitle style={{ fontSize: "18px", color: "#EDEDED", lineHeight: "1.4" }}>{p.title}</CardTitle>
                  <Badge style={{ backgroundColor: `rgba(${getDifficultyColor(p.difficulty).replace('#', '')}, 0.15)`, color: getDifficultyColor(p.difficulty), border: `1px solid ${getDifficultyColor(p.difficulty)}` }}>
                    {p.difficulty.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                    {p.tags && p.tags.length > 0 ? (
                      p.tags.map(tag => (
                        <span key={tag} style={{ backgroundColor: "#262626", color: "#9CA3AF", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#6B7280", fontSize: "12px", fontStyle: "italic" }}>No tags</span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px" }}>
                      <span style={{ color: "#EDEDED", fontWeight: 600 }}>{p.sampleInput ? 1 : 0}</span> Sample Case
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px" }}>
                      <span style={{ color: "#EDEDED", fontWeight: 600 }}>{p.hiddenTestCases?.length || 0}</span> Hidden Cases
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "auto", borderTop: "1px solid #262626", paddingTop: "16px" }}>
                  <Button variant="default" style={{ flex: 1, backgroundColor: "#D97706", color: "#171717" }} onClick={() => setViewingProblem(p)}>
                    View
                  </Button>
                  <Button variant="outline" style={{ flex: 1 }} onClick={() => alert("Edit feature coming soon!")}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => alert("Delete feature coming soon!")}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
