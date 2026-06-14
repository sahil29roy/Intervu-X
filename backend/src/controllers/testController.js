import { z } from "zod";
import mongoose from "mongoose";
import McqTest from "../models/McqTest.js";
import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import User from "../models/User.js";

// Zod validation schemas
const createTestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().default(""),
    category: z.string().min(1, "Category is required"),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    passingMarks: z.number().min(0, "Passing marks cannot be negative"),
    isActive: z.boolean().optional().default(true)
});

const addQuestionSchema = z.object({
    question: z.string().min(1, "Question text is required"),
    options: z.array(z.string().min(1, "Option text cannot be empty")).length(4, "Must provide exactly 4 options"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    explanation: z.string().optional().default(""),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    subject: z.string().min(1, "Subject is required")
});

// POST /api/tests (Admin only)
export const createTest = async (req, res) => {
    try {
        const parsed = createTestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { title, description, category, duration, passingMarks, isActive } = parsed.data;

        const newTest = await McqTest.create({
            title,
            description,
            category,
            duration,
            totalMarks: 0, // initially 0, updated when questions are added
            passingMarks,
            isActive
        });

        return res.status(201).json({
            message: "MCQ Test created successfully",
            test: newTest
        });
    } catch (error) {
        console.error("Error in createTest controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /api/tests/:id/questions (Admin only)
export const addQuestionToTest = async (req, res) => {
    try {
        const testId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }

        const test = await McqTest.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "MCQ Test not found" });
        }

        const parsed = addQuestionSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { question, options, correctAnswer, explanation, difficulty, subject } = parsed.data;

        // Verify that correct answer is one of the options
        if (!options.includes(correctAnswer)) {
            return res.status(400).json({ message: "Correct answer must match one of the options" });
        }

        const newQuestion = await Question.create({
            testId,
            question,
            options,
            correctAnswer,
            explanation,
            difficulty,
            subject
        });

        // Increment total marks by 1 for this test (1 mark per question)
        test.totalMarks += 1;
        await test.save();

        return res.status(201).json({
            message: "Question added successfully",
            question: newQuestion,
            test
        });
    } catch (error) {
        console.error("Error in addQuestionToTest controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/tests (Admins & Candidates)
export const getTests = async (req, res) => {
    try {
        let query = {};
        // Candidates only see active tests
        if (req.user.role === "candidate") {
            query.isActive = true;
        }

        const tests = await McqTest.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ tests });
    } catch (error) {
        console.error("Error in getTests controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/tests/:id (Admins & Candidates)
// Note: Candidates do NOT get correctAnswer or explanation fields in the questions list.
export const getTestById = async (req, res) => {
    try {
        const testId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }

        const test = await McqTest.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "MCQ Test not found" });
        }

        let questions;
        if (req.user.role === "admin") {
            questions = await Question.find({ testId });
        } else {
            // Check if candidate has already attempted this test
            const hasAttempted = await TestAttempt.findOne({ candidateId: req.user._id, testId });
            if (hasAttempted) {
                // If they have completed it, they are allowed to see correct answers for review
                questions = await Question.find({ testId });
            } else {
                // Candidate gets questions but NOT correctAnswer and explanation (cheating prevention)
                questions = await Question.find({ testId }).select("-correctAnswer -explanation");
            }
        }

        return res.status(200).json({
            test,
            questions
        });
    } catch (error) {
        console.error("Error in getTestById controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /api/tests/:id/submit (Candidate only)
export const submitTestAttempt = async (req, res) => {
    try {
        const testId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }

        const test = await McqTest.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "MCQ Test not found" });
        }

        const answers = req.body.answers || []; // [{ questionId, selectedOption }]
        const questions = await Question.find({ testId });

        let correctCount = 0;
        let wrongCount = 0;

        const detailedBreakdown = questions.map((q) => {
            const userAnswer = answers.find(a => a.questionId === q._id.toString());
            const selectedOption = userAnswer ? userAnswer.selectedOption : "";
            const isCorrect = selectedOption === q.correctAnswer;

            if (selectedOption) {
                if (isCorrect) correctCount++;
                else wrongCount++;
            } else {
                // Not answered is counted as wrong/unanswered
                wrongCount++;
            }

            return {
                questionId: q._id,
                question: q.question,
                options: q.options,
                selectedOption,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation
            };
        });

        // 1 mark per question
        const score = correctCount;
        const totalQuestions = questions.length;

        const testAttempt = await TestAttempt.create({
            candidateId: req.user._id,
            testId,
            score,
            totalQuestions,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            submittedAt: new Date()
        });

        return res.status(201).json({
            message: "Test submitted successfully",
            attempt: testAttempt,
            results: detailedBreakdown,
            passed: score >= test.passingMarks
        });
    } catch (error) {
        console.error("Error in submitTestAttempt controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/tests/my-attempts (Candidate only)
export const getMyAttempts = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({ candidateId: req.user._id })
            .populate("testId", "title category totalMarks passingMarks duration")
            .sort({ submittedAt: -1 });

        return res.status(200).json({ attempts });
    } catch (error) {
        console.error("Error in getMyAttempts controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/tests/attempts/all (Admin only)
export const getAllAttempts = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({})
            .populate("candidateId", "name email role profilePicture")
            .populate("testId", "title category totalMarks")
            .sort({ submittedAt: -1 });

        return res.status(200).json({ attempts });
    } catch (error) {
        console.error("Error in getAllAttempts controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
