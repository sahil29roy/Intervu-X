import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "ongoing", "completed", "cancelled"],
        default: "pending"
    },
    meetingLink: {
        type: String,
        default: ""
    },
    feedback: {
        technical: {
            type: String,
            default: ""
        },
        communication: {
            type: String,
            default: ""
        },
        problemSolving: {
            type: String,
            default: ""
        },
        remarks: {
            type: String,
            default: ""
        },
        recommendation: {
            type: String,
            default: ""
        }
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
