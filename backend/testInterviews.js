import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import Interview from "./src/models/Interview.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret_key";
const API_URL = "http://localhost:3000/api";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

async function test() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to database for test setup.");

        // 1. Create or retrieve test users
        const passwordHash = await bcrypt.hash("password123", 10);
        
        let admin = await User.findOne({ email: "admin_test@example.com" });
        if (!admin) {
            admin = await User.create({ name: "Test Admin", email: "admin_test@example.com", password: passwordHash, role: "admin" });
        }
        
        let interviewer = await User.findOne({ email: "interviewer_test@example.com" });
        if (!interviewer) {
            interviewer = await User.create({ name: "Test Interviewer", email: "interviewer_test@example.com", password: passwordHash, role: "interviewer", headline: "Lead Engineer", company: "IntervuX Tech" });
        }
        
        let candidate = await User.findOne({ email: "candidate_test@example.com" });
        if (!candidate) {
            candidate = await User.create({ name: "Test Candidate", email: "candidate_test@example.com", password: passwordHash, role: "candidate", skills: ["JavaScript", "React"] });
        }

        const adminToken = generateToken(admin._id);
        const interviewerToken = generateToken(interviewer._id);
        const candidateToken = generateToken(candidate._id);

        console.log("Tokens generated successfully.");

        let testInterviewId = null;

        // --- Test 1: Admin creates an interview ---
        console.log("\n--- Test 1: POST /api/interviews (Admin) ---");
        const createRes = await fetch(`${API_URL}/interviews`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${adminToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                candidateId: candidate._id.toString(),
                interviewerId: interviewer._id.toString(),
                scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                duration: 45,
                meetingLink: "https://zoom.us/test"
            })
        });
        const createData = await createRes.json();
        console.log("Status:", createRes.status);
        console.log("Body:", JSON.stringify(createData, null, 2));
        if (createRes.status === 201) {
            testInterviewId = createData.interview._id;
        }

        // --- Test 2: Authorization Check (Candidate tries to create interview) ---
        console.log("\n--- Test 2: POST /api/interviews (Forbidden Check for Candidate) ---");
        const badCreateRes = await fetch(`${API_URL}/interviews`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${candidateToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                candidateId: candidate._id.toString(),
                interviewerId: interviewer._id.toString(),
                scheduledDate: new Date().toISOString(),
                duration: 45
            })
        });
        console.log("Status (Expected 403):", badCreateRes.status);
        console.log("Body:", await badCreateRes.json());

        if (testInterviewId) {
            // --- Test 3: Candidate fetches their interviews ---
            console.log("\n--- Test 3: GET /api/interviews/my (Candidate) ---");
            const getMyRes = await fetch(`${API_URL}/interviews/my`, {
                headers: { "Authorization": `Bearer ${candidateToken}` }
            });
            console.log("Status:", getMyRes.status);
            const getMyData = await getMyRes.json();
            console.log("Interviews Found:", getMyData.interviews?.length);
            if (getMyData.interviews?.length > 0) {
                console.log("First Interview Populated Interviewer Name:", getMyData.interviews[0].interviewerId?.name);
            }

            // --- Test 4: Interviewer fetches their assigned interviews ---
            console.log("\n--- Test 4: GET /api/interviews/assigned (Interviewer) ---");
            const getAssignedRes = await fetch(`${API_URL}/interviews/assigned`, {
                headers: { "Authorization": `Bearer ${interviewerToken}` }
            });
            console.log("Status:", getAssignedRes.status);
            const getAssignedData = await getAssignedRes.json();
            console.log("Interviews Found:", getAssignedData.interviews?.length);
            if (getAssignedData.interviews?.length > 0) {
                console.log("First Interview Populated Candidate Name:", getAssignedData.interviews[0].candidateId?.name);
            }

            // --- Test 5: Interviewer submits feedback ---
            console.log("\n--- Test 5: PUT /api/interviews/:id/feedback (Interviewer) ---");
            const feedbackRes = await fetch(`${API_URL}/interviews/${testInterviewId}/feedback`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${interviewerToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    technical: "Strong JS fundamentals, needs design practice.",
                    communication: "Excellent clarity and explanation.",
                    problemSolving: "Good, optimal solution achieved.",
                    remarks: "Highly recommended for the role.",
                    recommendation: "strong-hire"
                })
            });
            console.log("Status:", feedbackRes.status);
            const feedbackData = await feedbackRes.json();
            console.log("Updated Status (Expected completed):", feedbackData.interview?.status);
            console.log("Feedback Submitted:", feedbackData.interview?.feedback);
        }

        // --- Cleanup test records ---
        console.log("\nCleaning up test records...");
        if (testInterviewId) {
            await Interview.findByIdAndDelete(testInterviewId);
        }
        await User.findByIdAndDelete(admin._id);
        await User.findByIdAndDelete(interviewer._id);
        await User.findByIdAndDelete(candidate._id);
        console.log("Cleanup complete.");

    } catch (err) {
        console.error("Test failed with error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

test();
