import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

// generate token method
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, ENV.JWT_SECRET || "fallback_jwt_secret_key", {
        expiresIn: "7d",
    });
};

// Zod Validation Schemas
const registerSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "interviewer", "candidate"]).optional().default("candidate"),
    profilePicture: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    skills: z.array(z.string()).optional().default([]),
    resumeUrl: z.string().optional().default("")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z.string().min(1, "Password is required")
});

// Register User
export const register = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { name, email, password, role, profilePicture, phone, skills, resumeUrl } = parsed.data;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new User
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profilePicture,
            phone,
            skills,
            resumeUrl,
            isActive: true
        });

        // Generate JWT
        const token = generateToken(newUser._id);

        // Set JWT as cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
        });

        // Respond with user details
        const userJson = newUser.toJSON();
        delete userJson.password;

        return res.status(201).json({
            token,
            user: userJson
        });
    } catch (error) {
        console.error("Error in register controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { email, password } = parsed.data;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // user active or not ..
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

        const userJson = user.toJSON();
        delete userJson.password;

        return res.status(200).json({
            token,
            user: userJson
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
