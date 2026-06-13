import mongoose from "mongoose";

const codingQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    constraints: {
        type: String,
        default: ""
    },
    sampleInput: {
        type: String,
        default: ""
    },
    sampleOutput: {
        type: String,
        default: ""
    },
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const CodingQuestion = mongoose.model("CodingQuestion", codingQuestionSchema);
export default CodingQuestion;
