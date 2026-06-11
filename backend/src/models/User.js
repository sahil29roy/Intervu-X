import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "interviewer", "candidate"],
        default: "candidate"
    },
    profilePicture: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    headline: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    designation: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    yearsOfExperience: {
        type: Number,
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    githubLink: {
        type: String,
        default: ""
    },
    linkedinLink: {
        type: String,
        default: ""
    },
    portfolioLink: {
        type: String,
        default: ""
    },
    expertiseAreas: {
        type: [String],
        default: []
    },
    education: {
        degree: { type: String, default: "" },
        branch: { type: String, default: "" },
        college: { type: String, default: "" },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        cgpa: { type: Number, default: null }
    },
    resumeUrl: {
        type: String,
        default: ""
    },
    preferredRole: {
        type: String,
        default: ""
    },
    preferredLocation: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
