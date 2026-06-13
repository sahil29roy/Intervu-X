import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "McqTest",
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    wrongAnswers: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date,
        required: true
    }
});

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;
