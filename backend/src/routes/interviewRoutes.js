import express from "express";
import {
    createInterview,
    getMyInterviews,
    getAssignedInterviews,
    submitFeedback
} from "../controllers/interviewController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/interviews (Admin only)
router.post("/", protectRoute, authorizeRoles("admin"), createInterview);

// GET /api/interviews/my (Candidate only)
router.get("/my", protectRoute, authorizeRoles("candidate"), getMyInterviews);

// GET /api/interviews/assigned (Interviewer only)
router.get("/assigned", protectRoute, authorizeRoles("interviewer"), getAssignedInterviews);

// PUT /api/interviews/:id/feedback (Interviewer only)
router.put("/:id/feedback", protectRoute, authorizeRoles("interviewer"), submitFeedback);

export default router;
