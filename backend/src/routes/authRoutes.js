import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { 
    getProfile, 
    updateProfile, 
    uploadProfilePicture, 
    uploadResume 
} from "../controllers/profileController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getMe);

// Profile routes
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.post("/profile/upload-pic", protectRoute, upload.single("profilePicture"), uploadProfilePicture);
router.post("/profile/upload-resume", protectRoute, upload.single("resume"), uploadResume);

export default router;
