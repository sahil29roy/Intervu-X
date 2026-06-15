import { z } from "zod";
import mongoose from "mongoose";
import CodingQuestion from "../models/CodingQuestion.js";
import CodingSubmission from "../models/CodingSubmission.js";
import { executeCode } from "../services/codeExecution/executeCode.js";

// Zod schemas
const createQuestionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    constraints: z.string().optional().default(""),
    sampleInput: z.string().optional().default(""),
    sampleOutput: z.string().optional().default(""),
    hiddenTestCases: z.array(z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required")
    })).min(1, "At least one hidden testcase is required"),
    tags: z.array(z.string()).optional().default([])
});

const updateQuestionSchema = createQuestionSchema.partial();

const submitAttemptSchema = z.object({
    language: z.string().min(1, "Language is required"),
    sourceCode: z.string().min(1, "Source code is required")
});

const runGeneralCodeSchema = z.object({
    language: z.string().min(1, "Language is required"),
    sourceCode: z.string().min(1, "Source code is required"),
    inputCase: z.string().optional().default("")
});

// Helper: Run JavaScript code in safe VM sandbox
// TODO: Implement secure Docker container runner for code execution.
// For now, testing-flow is maintained via mock execution logic in the submission controller.

// POST /api/coding/questions (Admin only)
export const createCodingQuestion = async (req, res) => {
    try {
        const parsed = createQuestionSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const newQuestion = await CodingQuestion.create(parsed.data);
        return res.status(201).json({
            message: "Coding question created successfully",
            question: newQuestion
        });
    } catch (error) {
        console.error("Error in createCodingQuestion:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// PUT /api/coding/questions/:id (Admin only)
export const updateCodingQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const parsed = updateQuestionSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const question = await CodingQuestion.findByIdAndUpdate(id, parsed.data, { new: true });
        if (!question) {
            return res.status(404).json({ message: "Coding question not found" });
        }

        return res.status(200).json({
            message: "Coding question updated successfully",
            question
        });
    } catch (error) {
        console.error("Error in updateCodingQuestion:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// DELETE /api/coding/questions/:id (Admin only)
export const deleteCodingQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const question = await CodingQuestion.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ message: "Coding question not found" });
        }

        return res.status(200).json({ message: "Coding question deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCodingQuestion:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/coding/questions (Admins & Candidates)
// Note: Candidates do not retrieve hidden test cases.
export const getCodingQuestions = async (req, res) => {
    try {
        let questions;
        if (req.user.role === "admin" || req.user.role === "interviewer") {
            questions = await CodingQuestion.find().sort({ createdAt: -1 });
        } else {
            // Exclude hidden test cases for candidates to prevent cheating
            questions = await CodingQuestion.find().select("-hiddenTestCases").sort({ createdAt: -1 });
        }
        return res.status(200).json({ questions });
    } catch (error) {
        console.error("Error in getCodingQuestions:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/coding/questions/:id (Admins & Candidates)
export const getCodingQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        let question;
        if (req.user.role === "admin" || req.user.role === "interviewer") {
            question = await CodingQuestion.findById(id);
        } else {
            question = await CodingQuestion.findById(id).select("-hiddenTestCases");
        }

        if (!question) {
            return res.status(404).json({ message: "Coding question not found" });
        }

        return res.status(200).json({ question });
    } catch (error) {
        console.error("Error in getCodingQuestionById:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /api/coding/questions/:id/submit (Candidate only)
export const submitCodingAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const question = await CodingQuestion.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Coding question not found" });
        }

        const parsed = submitAttemptSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { language, sourceCode } = parsed.data;

        // Currently, only javascript is natively executed
        if (language.toLowerCase() !== "javascript") {
            return res.status(400).json({ message: "Only JavaScript is supported for execution currently" });
        }

        const testCases = question.hiddenTestCases || [];
        if (testCases.length === 0) {
            return res.status(500).json({ message: "No test cases configured for this question" });
        }

        let passedCount = 0;
        let totalExecutionTime = 0;
        let finalVerdict = "Accepted";
        let firstFailedTestCase = null;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            
            // Execute the code using our execution service
            const result = await executeCode(language, sourceCode, tc.input);

            if (!result.success) {
                finalVerdict = result.verdict;
                firstFailedTestCase = {
                    testCaseIndex: i + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.output,
                    error: result.error
                };
                break;
            }

            const cleanExpected = tc.output.trim().replace(/\r\n/g, "\n");
            const cleanActual = result.output.trim().replace(/\r\n/g, "\n");

            totalExecutionTime += result.executionTimeMs;

            if (cleanActual !== cleanExpected) {
                finalVerdict = "Wrong Answer";
                firstFailedTestCase = {
                    testCaseIndex: i + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.output
                };
                break;
            }

            passedCount++;
        }

        // Calculate score percentage
        const score = Math.round((passedCount / testCases.length) * 100);

        // Save coding submission record
        const submission = await CodingSubmission.create({
            candidateId: req.user._id,
            questionId: id,
            language,
            sourceCode,
            verdict: finalVerdict,
            executionTime: Math.round(totalExecutionTime),
            memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024), // heap size in KB
            score
        });

        return res.status(201).json({
            message: "Submission evaluated",
            submission: {
                id: submission._id,
                verdict: submission.verdict,
                score: submission.score,
                executionTime: submission.executionTime,
                memoryUsed: submission.memoryUsed,
                submittedAt: submission.submittedAt
            },
            passedCount,
            totalCount: testCases.length,
            failedTestCaseDetails: finalVerdict !== "Accepted" ? firstFailedTestCase : null
        });

    } catch (error) {
        console.error("Error in submitCodingAttempt:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /api/coding/questions/:id/run-tests (Candidate only)
export const runTestsAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }

        const question = await CodingQuestion.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Coding question not found" });
        }

        const parsed = submitAttemptSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { language, sourceCode } = parsed.data;

        // Currently, only javascript is natively executed
        if (language.toLowerCase() !== "javascript") {
            return res.status(400).json({ message: "Only JavaScript is supported for execution currently" });
        }

        if (!question.sampleInput || !question.sampleOutput) {
            return res.status(500).json({ message: "No sample test case configured for this question" });
        }

        let passedCount = 0;
        let totalExecutionTime = 0;
        let finalVerdict = "Accepted";
        let failedTestCaseDetails = null;

        // Execute the code using our execution service against sample input
        const result = await executeCode(language, sourceCode, question.sampleInput);

        if (!result.success) {
            finalVerdict = result.verdict;
            failedTestCaseDetails = {
                testCaseIndex: 1,
                input: question.sampleInput,
                expectedOutput: question.sampleOutput,
                actualOutput: result.output,
                error: result.error
            };
        } else {
            const cleanExpected = question.sampleOutput.trim().replace(/\r\n/g, "\n");
            const cleanActual = result.output.trim().replace(/\r\n/g, "\n");

            totalExecutionTime += result.executionTimeMs;

            if (cleanActual !== cleanExpected) {
                finalVerdict = "Wrong Answer";
                failedTestCaseDetails = {
                    testCaseIndex: 1,
                    input: question.sampleInput,
                    expectedOutput: question.sampleOutput,
                    actualOutput: result.output
                };
            } else {
                passedCount = 1;
            }
        }

        return res.status(200).json({
            message: "Dry run evaluated",
            submission: {
                verdict: finalVerdict,
                score: passedCount === 1 ? 100 : 0,
                executionTime: Math.round(totalExecutionTime),
                memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024),
            },
            passedCount,
            totalCount: 1,
            failedTestCaseDetails
        });

    } catch (error) {
        console.error("Error in runTestsAttempt:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/coding/submissions/my (Candidate only)
export const getMyCodingSubmissions = async (req, res) => {
    try {
        const submissions = await CodingSubmission.find({ candidateId: req.user._id })
            .populate("questionId", "title difficulty tags")
            .sort({ submittedAt: -1 });

        return res.status(200).json({ submissions });
    } catch (error) {
        console.error("Error in getMyCodingSubmissions:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/coding/submissions/all (Admin/Interviewer only)
export const getAllCodingSubmissions = async (req, res) => {
    try {
        const submissions = await CodingSubmission.find()
            .populate("candidateId", "name email role")
            .populate("questionId", "title difficulty")
            .sort({ submittedAt: -1 });

        return res.status(200).json({ submissions });
    } catch (error) {
        console.error("Error in getAllCodingSubmissions:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /api/coding/run (Authenticated only)
export const runGeneralCode = async (req, res) => {
    try {
        const parsed = runGeneralCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { language, sourceCode, inputCase } = parsed.data;

        if (language.toLowerCase() !== "javascript") {
            return res.status(400).json({ message: "Only JavaScript is supported for execution currently" });
        }

        const result = await executeCode(language, sourceCode, inputCase);

        return res.status(200).json({
            message: "Execution completed",
            result
        });
    } catch (error) {
        console.error("Error in runGeneralCode:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
