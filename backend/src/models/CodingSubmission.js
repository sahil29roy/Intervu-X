import mongoose from "mongoose";

const codingSubmissionSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodingQuestion",
        required: true
    },
    language: {
        type: String,
        required: true
    },
    sourceCode: {
        type: String,
        required: true
    },
    verdict: {
        type: String, // e.g. "Accepted", "Wrong Answer", "Time Limit Exceeded", etc.
        required: true
    },
    executionTime: {
        type: Number, // in ms
        default: 0
    },
    memoryUsed: {
        type: Number, // in KB
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const CodingSubmission = mongoose.model("CodingSubmission", codingSubmissionSchema);
export default CodingSubmission;
