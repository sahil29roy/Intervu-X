import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "McqTest",
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: "A question must have exactly 4 options."
        },
        required: true
    },
    correctAnswer: {
        type: String, // e.g. "Option A", (or actual answer text)
        required: true
    },
    explanation: {
        type: String,
        default: ""
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    subject: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const Question = mongoose.model("Question", questionSchema);
export default Question;
