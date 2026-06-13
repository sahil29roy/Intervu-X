import mongoose from "mongoose";

const demoInterviewSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["HR", "Technical", "Coding"],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    communicationScore: {
        type: Number,
        required: true
    },
    technicalScore: {
        type: Number,
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    feedback: {
        type: String,
        default: ""
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const DemoInterview = mongoose.model("DemoInterview", demoInterviewSchema);
export default DemoInterview;
