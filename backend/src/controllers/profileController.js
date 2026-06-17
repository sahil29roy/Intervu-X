import { z } from "zod";
import User from "../models/User.js";

// Zod Validation Schema for Profile Update
const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").trim().optional(),
    phone: z.string().optional(),
    profilePicture: z.string().optional(),
    headline: z.string().optional(),
    bio: z.string().optional(),
    designation: z.string().optional(),
    company: z.string().optional(),
    yearsOfExperience: z.number().nullable().optional(),
    skills: z.array(z.string()).optional(),
    githubLink: z.string().optional(),
    linkedinLink: z.string().optional(),
    portfolioLink: z.string().optional(),
    expertiseAreas: z.array(z.string()).optional(),
    education: z.object({
        degree: z.string().optional(),
        branch: z.string().optional(),
        college: z.string().optional(),
        startYear: z.number().nullable().optional(),
        endYear: z.number().nullable().optional(),
        cgpa: z.number().nullable().optional()
    }).optional(),
    resumeUrl: z.string().optional(),
    preferredRole: z.string().optional(),
    preferredLocation: z.string().optional()
});

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        // req.user is already populated by protectRoute middleware
        return res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("Error in getProfile controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const userId = req.user._id;

        // Handle nested object merge for education if provided
        let updateData = { ...parsed.data };
        if (parsed.data.education) {
            const currentProfile = await User.findById(userId);
            if (currentProfile) {
                updateData.education = {
                    ...currentProfile.education,
                    ...parsed.data.education
                };
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image file" });
        }

        // Formulate static file URL
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        // Update profile in DB
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { profilePicture: fileUrl } },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile picture uploaded successfully",
            profilePicture: fileUrl,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error in uploadProfilePicture controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a document file" });
        }

        // Formulate static file URL
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        // Update profile in DB
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { resumeUrl: fileUrl } },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Resume uploaded successfully",
            resumeUrl: fileUrl,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error in uploadResume controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
