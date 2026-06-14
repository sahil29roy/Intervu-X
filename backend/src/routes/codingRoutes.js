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
    getAllCodingSubmissions
} from "../controllers/codingController.js";

const router = express.Router();

// Candidates, Interviewers, and Admins
router.get("/questions", protectRoute, getCodingQuestions);
router.get("/questions/:id", protectRoute, getCodingQuestionById);

// Candidate only
router.post("/questions/:id/submit", protectRoute, authorizeRoles("candidate"), submitCodingAttempt);
router.get("/submissions/my", protectRoute, authorizeRoles("candidate"), getMyCodingSubmissions);

// Admin only
router.post("/questions", protectRoute, authorizeRoles("admin"), createCodingQuestion);
router.put("/questions/:id", protectRoute, authorizeRoles("admin"), updateCodingQuestion);
router.delete("/questions/:id", protectRoute, authorizeRoles("admin"), deleteCodingQuestion);

// Admin & Interviewer only
router.get("/submissions/all", protectRoute, authorizeRoles("admin", "interviewer"), getAllCodingSubmissions);

export default router;
