import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["interview_scheduled", "feedback_submitted", "test_submitted", "coding_attempt", "system"],
        default: "system"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: ""
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
