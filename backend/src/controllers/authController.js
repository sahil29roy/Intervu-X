import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, ENV.JWT_SECRET || "fallback_jwt_secret_key", {
        expiresIn: "7d",
    });
};

// Register User
export const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, skills, resumeUrl } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Validate role if provided
        if (role && !["admin", "interviewer", "candidate"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be candidate, interviewer, or admin." });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new User
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "candidate",
            phone: phone || "",
            skills: skills || [],
            resumeUrl: resumeUrl || "",
            isActive: true
        });

        // Generate JWT
        const token = generateToken(newUser._id);

        // Set JWT as cookie (optional fallback for web clients)
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
        });

        // Respond with user details (excluding password) and token
        return res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                skills: newUser.skills,
                resumeUrl: newUser.resumeUrl,
                isActive: newUser.isActive,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            }
        });
    } catch (error) {
        console.error("Error in register controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // Generate JWT
        const token = generateToken(user._id);

        // Set JWT as cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
        });

        // Respond with user details and token
        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                skills: user.skills,
                resumeUrl: user.resumeUrl,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get authenticated user details
export const getMe = async (req, res) => {
    try {
        // req.user is already populated by protectRoute middleware
        return res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
