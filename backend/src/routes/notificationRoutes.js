import express from "express";
import { 
    getMyNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from "../controllers/notificationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, getMyNotifications);
router.put("/read-all", protectRoute, markAllNotificationsAsRead);
router.put("/:id/read", protectRoute, markNotificationAsRead);

export default router;
