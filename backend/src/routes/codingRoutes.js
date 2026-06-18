import express from "express";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createCodingQuestion,
    updateCodingQuestion,
    deleteCodingQuestion,
    getCodingQuestions,
    getCodingQuestionById,
    submitCodingAttempt,
    getMyCodingSubmissions,
    getAllCodingSubmissions,
    runGeneralCode,
    runTestsAttempt
} from "../controllers/codingController.js";

const router = express.Router();

// Candidates, Interviewers, and Admins
router.get("/questions", protectRoute, getCodingQuestions);
router.get("/questions/:id", protectRoute, getCodingQuestionById);
router.post("/run", protectRoute, runGeneralCode);

// Candidate, Interviewer, and Admin
router.post("/questions/:id/submit", protectRoute, authorizeRoles("candidate", "admin", "interviewer"), submitCodingAttempt);
router.post("/questions/:id/run-tests", protectRoute, authorizeRoles("candidate", "admin", "interviewer"), runTestsAttempt);
router.get("/submissions/my", protectRoute, authorizeRoles("candidate", "admin", "interviewer"), getMyCodingSubmissions);

// Admin only
router.post("/questions", protectRoute, authorizeRoles("admin"), createCodingQuestion);
router.put("/questions/:id", protectRoute, authorizeRoles("admin"), updateCodingQuestion);
router.delete("/questions/:id", protectRoute, authorizeRoles("admin"), deleteCodingQuestion);

// Admin & Interviewer only
router.get("/submissions/all", protectRoute, authorizeRoles("admin", "interviewer"), getAllCodingSubmissions);

export default router;

