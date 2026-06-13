import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import McqTest from "../models/McqTest.js";
import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import { ENV } from "../lib/env.js";

const PORT = ENV.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/tests`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log("Connecting to database for MCQ flow test...");
    await mongoose.connect(ENV.DB_URL || "mongodb://localhost:27017/intervux");
    console.log("Connected to MongoDB.");

    let adminUser, candidateUser;
    let adminToken, candidateToken;
    let testId;
    let questionIds = [];
    let attemptId;

    try {
        // 1. Create Test Users
        console.log("--- Setup: Creating Test Users ---");
        const hashedAdminPassword = await bcrypt.hash("adminPass123", 10);
        adminUser = await User.create({
            name: "Test MCQ Admin",
            email: "mcq_admin@example.com",
            password: hashedAdminPassword,
            role: "admin"
        });
        adminToken = jwt.sign({ id: adminUser._id }, ENV.JWT_SECRET || "fallback_jwt_secret_key", { expiresIn: "1h" });

        const hashedCandidatePassword = await bcrypt.hash("candidatePass123", 10);
        candidateUser = await User.create({
            name: "Test MCQ Candidate",
            email: "mcq_candidate@example.com",
            password: hashedCandidatePassword,
            role: "candidate"
        });
        candidateToken = jwt.sign({ id: candidateUser._id }, ENV.JWT_SECRET || "fallback_jwt_secret_key", { expiresIn: "1h" });

        console.log(`Users created: Admin (${adminUser.email}), Candidate (${candidateUser.email})`);

        // 2. Admin Creates MCQ Test
        console.log("\n--- Test 1: POST /api/tests (Admin Creates Test) ---");
        const createRes = await fetch(`${BASE_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "JavaScript Fundamentals",
                description: "Basic JS closures, promises, and event loop questions",
                category: "Technical",
                duration: 15,
                passingMarks: 2
            })
        });

        const createData = await createRes.json();
        console.log("Status Code:", createRes.status);
        if (createRes.status !== 201) throw new Error("Failed to create test");
        testId = createData.test._id;
        console.log("Test Created with ID:", testId);

        // 3. Admin Adds Questions
        console.log("\n--- Test 2: POST /api/tests/:id/questions (Admin Adds Questions) ---");
        const questionsData = [
            {
                question: "What is the output of typeof null in JavaScript?",
                options: ["'null'", "'undefined'", "'object'", "'string'"],
                correctAnswer: "'object'",
                explanation: "Historically, typeof null returns 'object' in JS.",
                subject: "JS Core",
                difficulty: "easy"
            },
            {
                question: "Which keyword is used to declare a block-scoped variable?",
                options: ["var", "let", "const", "Both let and const"],
                correctAnswer: "Both let and const",
                explanation: "let and const are block-scoped declarations.",
                subject: "JS ES6",
                difficulty: "easy"
            },
            {
                question: "What is the result of Promise.resolve(5).then(x => x + 1)?",
                options: ["5", "6", "Promise { <pending> }", "undefined"],
                correctAnswer: "6",
                explanation: ".then returns a promise resolved with the returned value.",
                subject: "JS Promises",
                difficulty: "medium"
            }
        ];

        for (const q of questionsData) {
            const addQRes = await fetch(`${BASE_URL}/${testId}/questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                },
                body: JSON.stringify(q)
            });
            const addQData = await addQRes.json();
            if (addQRes.status !== 201) throw new Error(`Failed to add question: ${q.question}`);
            questionIds.push(addQData.question._id);
            console.log(`Added question: ${addQData.question.question}`);
        }
        console.log(`Successfully added ${questionIds.length} questions.`);

        // 4. Candidate Retrieves Tests List
        console.log("\n--- Test 3: GET /api/tests (Candidate lists tests) ---");
        const getTestsRes = await fetch(`${BASE_URL}/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getTestsData = await getTestsRes.json();
        console.log("Status Code:", getTestsRes.status);
        console.log("Tests Available count:", getTestsData.tests.length);
        const foundTest = getTestsData.tests.find(t => t._id === testId);
        if (!foundTest) throw new Error("Created test not visible to candidate!");
        console.log("Found our test. Total Marks:", foundTest.totalMarks);

        // 5. Candidate Fetches Single Test details (Verify Cheating Prevention)
        console.log("\n--- Test 4: GET /api/tests/:id (Candidate retrieves test questions) ---");
        const getTestDetailRes = await fetch(`${BASE_URL}/${testId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getTestDetailData = await getTestDetailRes.json();
        console.log("Status Code:", getTestDetailRes.status);
        console.log("Questions retrieved count:", getTestDetailData.questions.length);

        const firstQ = getTestDetailData.questions[0];
        console.log("Checking first question properties...");
        console.log("Question text:", firstQ.question);
        console.log("Options:", firstQ.options);
        console.log("correctAnswer present?:", firstQ.correctAnswer !== undefined);
        console.log("explanation present?:", firstQ.explanation !== undefined);

        if (firstQ.correctAnswer !== undefined || firstQ.explanation !== undefined) {
            throw new Error("SECURITY FAILURE: correctAnswer or explanation leaked to Candidate!");
        }
        console.log("Security Check Passed! Correct answers and explanations are hidden.");

        // 6. Candidate Submits Answers
        console.log("\n--- Test 5: POST /api/tests/:id/submit (Candidate submits answers) ---");
        // We will answer 2 questions correctly and 1 incorrectly
        const submissionAnswers = [
            { questionId: questionIds[0], selectedOption: "'object'" }, // Correct
            { questionId: questionIds[1], selectedOption: "Both let and const" }, // Correct
            { questionId: questionIds[2], selectedOption: "5" } // Incorrect (Correct is 6)
        ];

        const submitRes = await fetch(`${BASE_URL}/${testId}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${candidateToken}`
            },
            body: JSON.stringify({ answers: submissionAnswers })
        });
        const submitData = await submitRes.json();
        console.log("Status Code:", submitRes.status);
        if (submitRes.status !== 201) throw new Error("Failed to submit test");
        attemptId = submitData.attempt._id;
        console.log("Score obtained:", submitData.attempt.score);
        console.log("Total questions:", submitData.attempt.totalQuestions);
        console.log("Correct answers count:", submitData.attempt.correctAnswers);
        console.log("Wrong answers count:", submitData.attempt.wrongAnswers);
        console.log("Passed status:", submitData.passed);

        if (submitData.attempt.score !== 2) throw new Error("Score calculation mismatch! Expected 2.");
        if (submitData.passed !== true) throw new Error("Pass logic mismatch! Should be true.");

        // 7. Candidate Fetches My Attempts
        console.log("\n--- Test 6: GET /api/tests/my-attempts (Candidate fetches previous attempts) ---");
        const getMyAttemptsRes = await fetch(`${BASE_URL}/my-attempts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${candidateToken}`
            }
        });
        const getMyAttemptsData = await getMyAttemptsRes.json();
        console.log("Status Code:", getMyAttemptsRes.status);
        console.log("Attempts count for Candidate:", getMyAttemptsData.attempts.length);
        if (getMyAttemptsData.attempts.length === 0) throw new Error("Candidate attempts list empty!");

        // 8. Admin Fetches All Attempts
        console.log("\n--- Test 7: GET /api/tests/all-attempts (Admin fetches all attempts) ---");
        const getAllAttemptsRes = await fetch(`${BASE_URL}/all-attempts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });
        const getAllAttemptsData = await getAllAttemptsRes.json();
        console.log("Status Code:", getAllAttemptsRes.status);
        console.log("Total platform attempts count:", getAllAttemptsData.attempts.length);
        if (getAllAttemptsData.attempts.length === 0) throw new Error("Admin attempts list empty!");

        console.log("\n=============================");
        console.log("ALL INTEGRATION TESTS PASSED!");
        console.log("=============================");

    } catch (err) {
        console.error("Test Flow Failed:", err.message);
    } finally {
        // 9. Cleanup DB Records
        console.log("\nCleaning up test database records...");
        if (adminUser) await User.findByIdAndDelete(adminUser._id);
        if (candidateUser) await User.findByIdAndDelete(candidateUser._id);
        if (testId) await McqTest.findByIdAndDelete(testId);
        for (const qId of questionIds) {
            await Question.findByIdAndDelete(qId);
        }
        if (attemptId) await TestAttempt.findByIdAndDelete(attemptId);
        console.log("Cleanup completed.");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests();
