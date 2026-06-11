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
    profilePic: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    resumeUrl: {
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
