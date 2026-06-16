import { z } from "zod";
import mongoose from "mongoose";
import Interview from "../models/Interview.js";
import User from "../models/User.js";

// Zod validation for creating an interview
const createInterviewSchema = z.object({
    candidateId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), "Invalid candidate ID"),
    interviewerId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), "Invalid interviewer ID"),
    scheduledDate: z.string().transform(val => new Date(val)).refine(val => !isNaN(val.getTime()), "Invalid scheduled date"),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    meetingLink: z.string().optional().default("")
});

// Zod validation for feedback
const submitFeedbackSchema = z.object({
    technical: z.string().optional().default(""),
    communication: z.string().optional().default(""),
    problemSolving: z.string().optional().default(""),
    remarks: z.string().optional().default(""),
    recommendation: z.string().optional().default("")
});

// POST /api/interviews (Admin only)
export const createInterview = async (req, res) => {
    try {
        const parsed = createInterviewSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { candidateId, interviewerId, scheduledDate, duration, meetingLink } = parsed.data;

        // Check if candidate exists and is indeed a candidate
        const candidate = await User.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate user not found" });
        }
        if (candidate.role !== "candidate") {
            return res.status(400).json({ message: "User is not a candidate" });
        }

        // Check if interviewer exists and is indeed an interviewer
        const interviewer = await User.findById(interviewerId);
        if (!interviewer) {
            return res.status(404).json({ message: "Interviewer user not found" });
        }
        if (interviewer.role !== "interviewer") {
            return res.status(400).json({ message: "User is not an interviewer" });
        }

        // Create new interview
        const newInterview = await Interview.create({
            candidateId,
            interviewerId,
            scheduledDate,
            duration,
            meetingLink,
            status: "pending"
        });

        return res.status(201).json({
            message: "Interview scheduled successfully",
            interview: newInterview
        });
    } catch (error) {
        console.error("Error in createInterview controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/interviews/my (Candidate only)
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ candidateId: req.user._id })
            .populate("interviewerId", "name email headline company profilePicture")
            .sort({ scheduledDate: 1 });

        return res.status(200).json({ interviews });
    } catch (error) {
        console.error("Error in getMyInterviews controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/interviews/assigned (Interviewer only)
export const getAssignedInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ 
            interviewerId: req.user._id,
            status: { $in: ["pending", "ongoing"] }
        })
            .populate("candidateId", "name email headline skills resumeUrl profilePicture")
            .sort({ scheduledDate: 1 });

        return res.status(200).json({ interviews });
    } catch (error) {
        console.error("Error in getAssignedInterviews controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// PUT /api/interviews/:id/feedback (Interviewer only)
export const submitFeedback = async (req, res) => {
    try {
        const parsed = submitFeedbackSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const interviewId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Verify that this interviewer is the one assigned to the interview
        if (interview.interviewerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You are not assigned to this interview" });
        }

        // Update feedback and complete the interview
        interview.feedback = parsed.data;
        interview.status = "completed";

        await interview.save();

        return res.status(200).json({
            message: "Feedback submitted successfully",
            interview
        });
    } catch (error) {
        console.error("Error in submitFeedback controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
