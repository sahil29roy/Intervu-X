import express from "express";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createTest,
    addQuestionToTest,
    getTests,
    getTestById,
    submitTestAttempt,
    getMyAttempts,
    getAllAttempts
} from "../controllers/testController.js";

const router = express.Router();

// Candidates & Admins
router.get("/", protectRoute, getTests);
router.get("/my-attempts", protectRoute, authorizeRoles("candidate"), getMyAttempts);
router.get("/all-attempts", protectRoute, authorizeRoles("admin"), getAllAttempts);
router.get("/:id", protectRoute, getTestById);

// Admin-only endpoints
router.post("/", protectRoute, authorizeRoles("admin"), createTest);
router.post("/:id/questions", protectRoute, authorizeRoles("admin"), addQuestionToTest);

// Candidate-only endpoints
router.post("/:id/submit", protectRoute, authorizeRoles("candidate"), submitTestAttempt);

export default router;
