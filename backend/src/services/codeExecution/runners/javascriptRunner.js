import fs from "fs";
import path from "path";
import { spawn } from "child_process";


// Runner for JavaScript solutions inside sandbox environment using Docker.
export const runJavaScript = async (sourceCode, inputCase) => {
  const runId = Math.random().toString(36).substring(2, 15);
  const tempDir = path.resolve("temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const solutionPath = path.join(tempDir, `solution_${runId}.mjs`);
  const wrapperPath = path.join(tempDir, `wrapper_${runId}.mjs`);

  // Write candidate code
  fs.writeFileSync(solutionPath, sourceCode);

  // Write wrapper code that polyfills readLine() from stdin
  const wrapperContent = `
import fs from 'fs';
const input = fs.readFileSync(0, 'utf-8');
const lines = input.split(/\\r?\\n/);
let currentLineIdx = 0;

globalThis.readLine = function() {
  if (currentLineIdx >= lines.length) return null;
  return lines[currentLineIdx++];
};

await import('./solution_${runId}.mjs');
`;
  fs.writeFileSync(wrapperPath, wrapperContent);

  const startTime = Date.now();

  return new Promise((resolve) => {
    // Spawn docker process with strict limits
    const child = spawn("docker", [
      "run",
      "--rm",
      "-i",
      "--network", "none",
      "--memory", "256m",
      "--cpus", "0.5",
      "-v", `${tempDir}:/app`,
      "-w", "/app",
      "intervux-nodejs",
      "node", `wrapper_${runId}.mjs`
    ], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdoutData = "";
    let stderrData = "";
    let isTimeout = false;

    // Set timeout limit (10000ms for Docker container startup headroom)
    const timeout = setTimeout(() => {
      isTimeout = true;
      child.kill("SIGKILL");
    }, 10000);

    // Pipe input case to stdin
    child.stdin.write(inputCase);
    child.stdin.end();

    child.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      const executionTimeMs = Date.now() - startTime;

      // Clean up temp files asynchronously with a slight delay to allow Windows to release file locks
      setTimeout(() => {
        try {
          if (fs.existsSync(solutionPath)) fs.unlinkSync(solutionPath);
          if (fs.existsSync(wrapperPath)) fs.unlinkSync(wrapperPath);
        } catch (err) {
          console.error("Cleanup error in JS runner:", err.message);
        }
      }, 100);

      if (isTimeout) {
        resolve({
          success: false,
          verdict: "Time Limit Exceeded",
          error: "Script execution timed out after 2000ms",
          output: stdoutData
        });
      } else if (code !== 0) {
        resolve({
          success: false,
          verdict: "Runtime Error",
          error: stderrData.trim() || `Process exited with code ${code}`,
          output: stdoutData
        });
      } else {
        resolve({
          success: true,
          verdict: "Accepted",
          output: stdoutData,
          executionTimeMs
        });
      }
    });
  });
};
