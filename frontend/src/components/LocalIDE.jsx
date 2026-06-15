import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

const Icon = {
  Play: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Code: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
};

const PRESETS = {
  hello: {
    id: "hello",
    name: "Hello World",
    code: `// Print Hello World to console\nconsole.log("Hello, World!");\n`,
    stdin: ""
  },
  stdin_loop: {
    id: "stdin_loop",
    name: "Read Inputs Line-by-Line",
    code: `// Use readLine() to read standard input line-by-line\n// Example: Reading N strings and printing greeting\n\nconst n = parseInt(readLine() || "0");\nconsole.log(\`Received \${n} names:\`);\n\nfor (let i = 0; i < n; i++) {\n  const name = readLine();\n  if (name) {\n    console.log(\`Hello, \${name}!\`);\n  }\n}\n`,
    stdin: "3\nAlice\nBob\nCharlie"
  },
  calculator: {
    id: "calculator",
    name: "Simple Calculator",
    code: `// Reads two numbers from stdin and prints their sum\n\nconst num1 = parseFloat(readLine() || "0");\nconst num2 = parseFloat(readLine() || "0");\n\nconsole.log(\`Number 1: \${num1}\`);\nconsole.log(\`Number 2: \${num2}\`);\nconsole.log(\`-----------------\`);\nconsole.log(\`Sum: \${num1 + num2}\`);\nconsole.log(\`Product: \${num1 * num2}\`);\n`,
    stdin: "12.5\n4"
  },
  factorial: {
    id: "factorial",
    name: "Factorial Calculator",
    code: `// Computes factorial of a number read from stdin\n\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconst inputNum = parseInt(readLine() || "0");\nif (isNaN(inputNum) || inputNum < 0) {\n  console.error("Please provide a valid non-negative integer");\n} else {\n  console.log(\`Factorial of \${inputNum} is: \${factorial(inputNum)}\`);\n}\n`,
    stdin: "6"
  }
};

export default function LocalIDE({ user, navigateToDashboard }) {
  const [selectedPresetId, setSelectedPresetId] = useState("hello");
  const [editorCode, setEditorCode] = useState(PRESETS.hello.code);
  const [stdinInput, setStdinInput] = useState(PRESETS.hello.stdin);
  
  // Terminal console state
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Execution metadata
  const [verdict, setVerdict] = useState(null); // null, "Accepted", "Runtime Error", "Time Limit Exceeded"
  const [executionTime, setExecutionTime] = useState(null);

  // Split resizer pane state
  const [leftWidth, setLeftWidth] = useState(55); // percentage
  const splitPaneRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    // Load last draft if stored locally
    const storedCode = localStorage.getItem(`local_ide_draft_${user._id}`);
    const storedStdin = localStorage.getItem(`local_ide_stdin_${user._id}`);
    if (storedCode) {
      setEditorCode(storedCode);
      setSelectedPresetId("custom");
    }
    if (storedStdin !== null) {
      setStdinInput(storedStdin);
    }
  }, [user._id]);

  const handleCodeChange = (val) => {
    setEditorCode(val);
    localStorage.setItem(`local_ide_draft_${user._id}`, val);
    setSelectedPresetId("custom");
  };

  const handleStdinChange = (e) => {
    const val = e.target.value;
    setStdinInput(val);
    localStorage.setItem(`local_ide_stdin_${user._id}`, val);
  };

  const handlePresetSelect = (presetId) => {
    if (presetId === "custom") return;
    const preset = PRESETS[presetId];
    if (preset) {
      setSelectedPresetId(presetId);
      setEditorCode(preset.code);
      setStdinInput(preset.stdin);
      localStorage.setItem(`local_ide_draft_${user._id}`, preset.code);
      localStorage.setItem(`local_ide_stdin_${user._id}`, preset.stdin);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the editor? This will clear your current changes.")) {
      const defaultPreset = PRESETS.hello;
      setSelectedPresetId("hello");
      setEditorCode(defaultPreset.code);
      setStdinInput(defaultPreset.stdin);
      localStorage.setItem(`local_ide_draft_${user._id}`, defaultPreset.code);
      localStorage.setItem(`local_ide_stdin_${user._id}`, defaultPreset.stdin);
      setStdout("");
      setStderr("");
      setVerdict(null);
      setExecutionTime(null);
    }
  };

  const handleRunCode = async () => {
    if (!editorCode.trim()) return;
    setRunning(true);
    setStdout("");
    setStderr("");
    setVerdict(null);
    setExecutionTime(null);

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
          inputCase: stdinInput
        })
      });

      const data = await res.json();
      if (res.ok && data.result) {
        const { success, verdict: execVerdict, output, error, executionTimeMs } = data.result;
        setVerdict(execVerdict);
        setStdout(output || "");
        setStderr(error || "");
        if (executionTimeMs !== undefined) {
          setExecutionTime(executionTimeMs);
        }
      } else {
        setStderr(data.message || "Failed to run code execution on server.");
        setVerdict("Runtime Error");
      }
    } catch (err) {
      setStderr("Network error. Unable to connect to execution server.");
      setVerdict("Runtime Error");
    } finally {
      setRunning(false);
    }
  };

  const handleClearOutput = () => {
    setStdout("");
    setStderr("");
    setVerdict(null);
    setExecutionTime(null);
  };

  const handleCopyOutput = () => {
    const textToCopy = [
      stdout ? `--- STDOUT ---\n${stdout}` : "",
      stderr ? `--- STDERR ---\n${stderr}` : ""
    ].filter(Boolean).join("\n\n");

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Resizer dragging handlers
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

    if (newLeftWidth >= 30 && newLeftWidth <= 80) {
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

  return (
    <div className="coding-workspace-wrapper">
      {/* Workspace Header */}
      <div className="coding-workspace-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#D97706", display: "inline-flex" }}>
            <Icon.Code />
          </span>
          <h2 style={{ fontSize: "20px", fontFamily: "Space Grotesk", color: "#EDEDED", fontWeight: 500 }}>
            Local Code Playground & IDE
          </h2>
          <Badge variant="teal">JavaScript (Node.js)</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Preset Boilerplates:</span>
          <select
            className="editor-lang-select"
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            style={{ minWidth: "160px", padding: "6px 12px" }}
          >
            <option value="hello">Hello World</option>
            <option value="stdin_loop">Read Inputs Line-by-Line</option>
            <option value="calculator">Simple Calculator</option>
            <option value="factorial">Factorial Calculator</option>
            <option value="custom">Custom Draft</option>
          </select>
          <Button
            variant="outline"
            onClick={handleReset}
            style={{ width: "auto", padding: "6px 12px", display: "inline-flex", alignItems: "center" }}
            title="Reset code and input case"
          >
            <Icon.Refresh /> Reset
          </Button>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="coding-split-pane" ref={splitPaneRef}>
        {/* Left Pane: Code Editor */}
        <div className="coding-pane-left" style={{ width: `${leftWidth}%`, backgroundColor: "#1E1E1E" }}>
          <div className="pane-right-content">
            <div className="editor-options-bar" style={{ backgroundColor: "#181818" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500 }}>SOURCE CODE EDITOR</span>
              <span style={{ fontSize: "11px", color: "#6B7280" }}>Autosaved</span>
            </div>
            <div className="editor-canvas-container" style={{ border: "none" }}>
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
                  tabSize: 2
                }}
              />
            </div>
            <div className="editor-actions-bar" style={{ backgroundColor: "#181818", borderTop: "1px solid #282828" }}>
              <Button
                variant="default"
                onClick={handleRunCode}
                disabled={running}
                style={{ width: "auto", background: "#D97706", borderColor: "#D97706", color: "#171717", fontWeight: 600, minWidth: "120px" }}
              >
                {running ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid #171717", borderTopColor: "transparent" }}></div>
                    Running...
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    <Icon.Play /> Run Code
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Pane Resizer Handle */}
        <div className="coding-pane-resizer" onMouseDown={handleMouseDown} />

        {/* Right Pane: Stdin & Terminal console Output */}
        <div className="coding-pane-right" style={{ width: `${100 - leftWidth}%` }}>
          <div className="pane-right-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            
            {/* STDIN Input Area */}
            <div style={{ padding: "16px 20px 12px 20px", display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #282828", backgroundColor: "#1A1A1A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", color: "#EDEDED", fontWeight: 600, letterSpacing: "0.05em" }}>CUSTOM STDIN INPUT</label>
                <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Fed into readLine()</span>
              </div>
              <Textarea
                placeholder="Enter input parameters here (one parameter per line if using readLine())..."
                value={stdinInput}
                onChange={handleStdinChange}
                style={{
                  backgroundColor: "#222",
                  borderColor: "#333",
                  color: "#EDEDED",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  borderRadius: "6px",
                  resize: "vertical",
                  minHeight: "80px",
                  maxHeight: "180px"
                }}
              />
            </div>

            {/* Terminal Console Output Header */}
            <div className="editor-options-bar" style={{ backgroundColor: "#151515", borderBottom: "1px solid #282828", padding: "10px 20px" }}>
              <span style={{ fontSize: "12px", color: "#EDEDED", fontWeight: 600, letterSpacing: "0.05em" }}>TERMINAL CONSOLE</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="reset-editor-btn"
                  onClick={handleCopyOutput}
                  disabled={!stdout && !stderr}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", padding: "4px 8px" }}
                  title="Copy terminal outputs"
                >
                  {copied ? <Icon.Check /> : <Icon.Copy />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  className="reset-editor-btn"
                  onClick={handleClearOutput}
                  disabled={!stdout && !stderr}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", padding: "4px 8px" }}
                  title="Clear console window"
                >
                  <Icon.Trash />
                  Clear
                </button>
              </div>
            </div>

            {/* Terminal Console output body */}
            <div style={{ flex: 1, backgroundColor: "#0A0A0A", padding: "20px", overflowY: "auto", fontFamily: "monospace", fontSize: "13px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* If running or not run yet */}
              {!stdout && !stderr && !verdict && (
                <div style={{ color: "#555", fontStyle: "italic", textAlign: "center", marginTop: "40px" }}>
                  Console output is empty. Press "Run Code" to compile and execute.
                </div>
              )}

              {/* Execution verdict metadata banner */}
              {verdict && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  backgroundColor: verdict === "Accepted" ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  borderColor: verdict === "Accepted" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
                  color: verdict === "Accepted" ? "#22C55E" : "#EF4444",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: 600 }}>Verdict: {verdict === "Accepted" ? "Success (Accepted)" : verdict}</span>
                  {executionTime !== null && (
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Time: {executionTime} ms</span>
                  )}
                </div>
              )}

              {/* Stdout stream */}
              {stdout && (
                <div style={{ whiteSpace: "pre-wrap", color: "#22C55E" }}>
                  {stdout}
                </div>
              )}

              {/* Stderr stream */}
              {stderr && (
                <div style={{
                  whiteSpace: "pre-wrap",
                  color: "#EF4444",
                  padding: "10px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  borderLeft: "3px solid #EF4444",
                  borderRadius: "0 4px 4px 0",
                  marginTop: "8px"
                }}>
                  {stderr}
                </div>
              )}
            </div>

            {/* Quick Tips Footer */}
            <div style={{ backgroundColor: "#151515", padding: "10px 20px", fontSize: "11px", color: "#6B7280", borderTop: "1px solid #282828" }}>
              💡 Hint: Polyfilled <code style={{ color: "#D97706" }}>readLine()</code> can be invoked to extract input streams sequentially. Print outputs using standard <code style={{ color: "#D97706" }}>console.log()</code>.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
