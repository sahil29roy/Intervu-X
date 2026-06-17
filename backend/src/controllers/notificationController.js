import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// GET /api/notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Get latest 50 notifications

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error in getMyNotifications:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// PUT /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error in markNotificationAsRead:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// PUT /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error in markAllNotificationsAsRead:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Helper function to create notification internally and emit socket event
export const createNotification = async (userId, title, message, type = "system", link = "") => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Broadcast real-time if global.io is initialized and user is connected
        if (global.io) {
            global.io.to(userId.toString()).emit("notification-received", notification);
        }

        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error.message);
        return null;
    }
};
