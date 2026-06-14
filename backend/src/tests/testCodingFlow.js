import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import CodingQuestion from "../models/CodingQuestion.js";
import CodingSubmission from "../models/CodingSubmission.js";
import { ENV } from "../lib/env.js";

const PORT = ENV.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/coding`;

async function runTests() {
    console.log("Connecting to database for Coding flow test...");
    await mongoose.connect(ENV.DB_URL || "mongodb://localhost:27017/intervux");
    console.log("Connected to MongoDB.");

    let adminUser, candidateUser;
    let adminToken, candidateToken;
    let questionId;
    let submissionIds = [];

    try {
        // 1. Create Test Users
        console.log("--- Setup: Creating Test Users ---");
        const hashedAdminPassword = await bcrypt.hash("adminPass123", 10);
        adminUser = await User.create({
            name: "Test Coding Admin",
            email: "coding_admin@example.com",
            password: hashedAdminPassword,
            role: "admin"
        });
        adminToken = jwt.sign({ id: adminUser._id }, ENV.JWT_SECRET || "fallback_jwt_secret_key", { expiresIn: "1h" });

        const hashedCandidatePassword = await bcrypt.hash("candidatePass123", 10);
        candidateUser = await User.create({
            name: "Test Coding Candidate",
            email: "coding_candidate@example.com",
            password: hashedCandidatePassword,
            role: "candidate"
        });
        candidateToken = jwt.sign({ id: candidateUser._id }, ENV.JWT_SECRET || "fallback_jwt_secret_key", { expiresIn: "1h" });

        console.log(`Users created: Admin (${adminUser.email}), Candidate (${candidateUser.email})`);

        // 2. Admin Creates Coding Question
        console.log("\n--- Test 1: POST /api/coding/questions (Admin Creates Question) ---");
        const createRes = await fetch(`${BASE_URL}/questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "Sum of Two Numbers",
                description: "Read two numbers from standard input line-by-line and print their sum.",
                difficulty: "easy",
                constraints: "Input integers will be between -10^9 and 10^9.",
                sampleInput: "5\n10",
                sampleOutput: "15",
                hiddenTestCases: [
                    { input: "2\n3", output: "5" },
                    { input: "100\n-50", output: "50" },
                    { input: "0\n0", output: "0" }
                ],
                tags: ["Basic", "Math"]
            })
        });

        const createData = await createRes.json();
        console.log("Status Code:", createRes.status);
        if (createRes.status !== 201) {
            console.error("Response body:", createData);
            throw new Error("Failed to create coding question");
        }
        questionId = createData.question._id;
        console.log("Coding Question Created with ID:", questionId);

        // 3. Candidate Lists Questions
        console.log("\n--- Test 2: GET /api/coding/questions (Candidate lists questions) ---");
        const getQuestionsRes = await fetch(`${BASE_URL}/questions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getQuestionsData = await getQuestionsRes.json();
        console.log("Status Code:", getQuestionsRes.status);
        console.log("Questions count:", getQuestionsData.questions.length);
        const foundQ = getQuestionsData.questions.find(q => q._id === questionId);
        if (!foundQ) throw new Error("Created question not returned to candidate");
        if (foundQ.hiddenTestCases !== undefined) {
            throw new Error("SECURITY FAILURE: hiddenTestCases leaked to Candidate in list view!");
        }
        console.log("Security Check 1 Passed: hiddenTestCases are hidden in list view.");

        // 4. Candidate Fetches Single Question Detail
        console.log("\n--- Test 3: GET /api/coding/questions/:id (Candidate retrieves question details) ---");
        const getDetailRes = await fetch(`${BASE_URL}/questions/${questionId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getDetailData = await getDetailRes.json();
        console.log("Status Code:", getDetailRes.status);
        if (getDetailData.question.hiddenTestCases !== undefined) {
            throw new Error("SECURITY FAILURE: hiddenTestCases leaked to Candidate in detail view!");
        }
        console.log("Security Check 2 Passed: hiddenTestCases are hidden in detail view.");

        // 5. Submit Correct Code (Expected: Accepted)
        console.log("\n--- Test 4: POST /api/coding/questions/:id/submit (Correct Code Submission) ---");
        const correctCode = `
            const a = parseInt(readLine());
            const b = parseInt(readLine());
            console.log(a + b);
        `;
        const submitCorrectRes = await fetch(`${BASE_URL}/questions/${questionId}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${candidateToken}`
            },
            body: JSON.stringify({
                language: "javascript",
                sourceCode: correctCode
            })
        });
        const correctResult = await submitCorrectRes.json();
        console.log("Status Code:", submitCorrectRes.status);
        console.log("Verdict:", correctResult.submission?.verdict);
        console.log("Score:", correctResult.submission?.score);
        console.log("Passed Count:", correctResult.passedCount, "/", correctResult.totalCount);

        if (correctResult.submission?.verdict !== "Accepted" || correctResult.submission?.score !== 100) {
            throw new Error(`Expected Accepted with 100 score, got: ${correctResult.submission?.verdict} (${correctResult.submission?.score})`);
        }
        submissionIds.push(correctResult.submission.id);

        // 6. Submit Incorrect Code (Expected: Wrong Answer)
        console.log("\n--- Test 5: POST /api/coding/questions/:id/submit (Incorrect Code Submission) ---");
        const incorrectCode = `
            const a = parseInt(readLine());
            const b = parseInt(readLine());
            console.log(a - b); // incorrect logic
        `;
        const submitIncorrectRes = await fetch(`${BASE_URL}/questions/${questionId}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${candidateToken}`
            },
            body: JSON.stringify({
                language: "javascript",
                sourceCode: incorrectCode
            })
        });
        const incorrectResult = await submitIncorrectRes.json();
        console.log("Status Code:", submitIncorrectRes.status);
        console.log("Verdict:", incorrectResult.submission?.verdict);
        console.log("Score:", incorrectResult.submission?.score);
        console.log("Failed Testcase Details:", incorrectResult.failedTestCaseDetails);

        if (incorrectResult.submission?.verdict !== "Wrong Answer") {
            throw new Error(`Expected Wrong Answer, got: ${incorrectResult.submission?.verdict}`);
        }
        submissionIds.push(incorrectResult.submission.id);

        // 7. Submit Code with Infinite Loop (Expected: Time Limit Exceeded)
        console.log("\n--- Test 6: POST /api/coding/questions/:id/submit (Infinite Loop Code Submission) ---");
        const timeoutCode = `
            while (true) {}
        `;
        const submitTimeoutRes = await fetch(`${BASE_URL}/questions/${questionId}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${candidateToken}`
            },
            body: JSON.stringify({
                language: "javascript",
                sourceCode: timeoutCode
            })
        });
        const timeoutResult = await submitTimeoutRes.json();
        console.log("Status Code:", submitTimeoutRes.status);
        console.log("Verdict:", timeoutResult.submission?.verdict);
        console.log("Error details:", timeoutResult.failedTestCaseDetails?.error);

        if (timeoutResult.submission?.verdict !== "Time Limit Exceeded") {
            throw new Error(`Expected Time Limit Exceeded, got: ${timeoutResult.submission?.verdict}`);
        }
        submissionIds.push(timeoutResult.submission.id);

        // 8. Candidate fetches their submissions
        console.log("\n--- Test 7: GET /api/coding/submissions/my (Candidate gets their submissions) ---");
        const getMySubRes = await fetch(`${BASE_URL}/submissions/my`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getMySubData = await getMySubRes.json();
        console.log("Status Code:", getMySubRes.status);
        console.log("My Submissions count:", getMySubData.submissions.length);
        if (getMySubData.submissions.length < 3) throw new Error("Submissions count mismatch");

        // 9. Admin fetches all submissions
        console.log("\n--- Test 8: GET /api/coding/submissions/all (Admin gets all submissions) ---");
        const getAllSubRes = await fetch(`${BASE_URL}/submissions/all`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });
        const getAllSubData = await getAllSubRes.json();
        console.log("Status Code:", getAllSubRes.status);
        console.log("All Submissions count:", getAllSubData.submissions.length);
        if (getAllSubData.submissions.length < 3) throw new Error("Global submissions count mismatch");

        console.log("\n=============================");
        console.log("ALL CODING FLOW TESTS PASSED!");
        console.log("=============================");

    } catch (err) {
        console.error("Coding Flow Test Failed:", err.message);
    } finally {
        // Cleanup records
        console.log("\nCleaning up database records...");
        if (adminUser) await User.findByIdAndDelete(adminUser._id);
        if (candidateUser) await User.findByIdAndDelete(candidateUser._id);
        if (questionId) await CodingQuestion.findByIdAndDelete(questionId);
        for (const sId of submissionIds) {
            await CodingSubmission.findByIdAndDelete(sId);
        }
        console.log("Cleanup completed.");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests();
