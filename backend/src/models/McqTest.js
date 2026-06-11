import mongoose from "mongoose";

const mcqTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const McqTest = mongoose.model("McqTest", mcqTestSchema);
export default McqTest;
