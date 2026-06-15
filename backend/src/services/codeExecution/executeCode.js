import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { runJavaScript } from "./runners/javascriptRunner.js";
import { runLocalFallback } from "./runners/localFallbackRunner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isDockerChecked = false;
let isDockerAvailable = false;

const checkDockerAvailability = () => {
  if (isDockerChecked) return isDockerAvailable;

  try {
    // Check if docker CLI and daemon are accessible
    execSync("docker info", { stdio: "ignore" });
    isDockerAvailable = true;
    console.log("Docker daemon is running. Docker execution mode enabled.");

    // Check if the required sandbox image exists
    try {
      const imageId = execSync("docker images -q intervux-nodejs", { encoding: "utf-8" }).trim();
      if (!imageId) {
        console.log("Sandbox Docker image 'intervux-nodejs' not found. Building it...");
        const contextDir = path.resolve(__dirname, "../../../containers/nodejs");
        execSync(`docker build -t intervux-nodejs "${contextDir}"`, { stdio: "ignore" });
        console.log("Sandbox Docker image built successfully.");
      } else {
        console.log("Sandbox Docker image 'intervux-nodejs' is ready.");
      }
    } catch (buildErr) {
      console.error("Failed to build/verify Sandbox Docker image:", buildErr.message);
      // Disable docker mode if building fails
      isDockerAvailable = false;
    }
  } catch (err) {
    console.warn("Docker daemon is not reachable or not installed. Falling back to local execution mode.");
    isDockerAvailable = false;
  }

  isDockerChecked = true;
  return isDockerAvailable;
};

/*
 -Main execution service to run candidate code in safe sandbox containers or local fallback.
 - Supported languages: javascript
 */
export const executeCode = async (language, sourceCode, inputCase) => {
  if (language.toLowerCase() !== "javascript") {
    return {
      success: false,
      verdict: "Runtime Error",
      error: `Unsupported language: '${language}'. Only JavaScript is supported.`,
      output: ""
    };
  }

  const useDocker = checkDockerAvailability();

  if (useDocker) {
    try {
      return await runJavaScript(sourceCode, inputCase);
    } catch (err) {
      console.error("Docker execution failed, attempting local fallback:", err.message);
      return await runLocalFallback(sourceCode, inputCase);
    }
  } else {
    return await runLocalFallback(sourceCode, inputCase);
  }
};
