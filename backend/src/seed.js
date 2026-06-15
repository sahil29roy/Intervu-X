import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import McqTest from "./models/McqTest.js";
import Question from "./models/Question.js";

export const osQuestions = [
  {
    question: "Which component of an operating system manages CPU scheduling?",
    options: [
      "Kernel",
      "Compiler",
      "Loader",
      "Assembler"
    ],
    correctAnswer: "Kernel",
    difficulty: "easy",
    category: "OS"
  },

  {
    question: "What is the primary purpose of a process control block (PCB)?",
    options: [
      "Store program source code",
      "Track process information",
      "Manage disk partitions",
      "Control network traffic"
    ],
    correctAnswer: "Track process information",
    difficulty: "easy",
    category: "OS"
  },

  {
    question: "Which scheduling algorithm may cause starvation?",
    options: [
      "Round Robin",
      "FCFS",
      "Shortest Job First",
      "Multilevel Queue"
    ],
    correctAnswer: "Shortest Job First",
    difficulty: "medium",
    category: "OS"
  },

  {
    question: "A deadlock can occur when processes compete for:",
    options: [
      "Shared resources",
      "CPU registers",
      "Source files",
      "Program variables"
    ],
    correctAnswer: "Shared resources",
    difficulty: "easy",
    category: "OS"
  },

  {
    question: "Which memory management technique divides memory into fixed-size blocks?",
    options: [
      "Segmentation",
      "Paging",
      "Swapping",
      "Compaction"
    ],
    correctAnswer: "Paging",
    difficulty: "medium",
    category: "OS"
  },

  {
    question: "What is the main purpose of virtual memory?",
    options: [
      "Increase cache size",
      "Reduce CPU usage",
      "Extend logical memory space",
      "Improve disk speed"
    ],
    correctAnswer: "Extend logical memory space",
    difficulty: "medium",
    category: "OS"
  },

  {
    question: "Which of the following is NOT a necessary condition for deadlock?",
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption",
      "Circular Wait"
    ],
    correctAnswer: "Preemption",
    difficulty: "hard",
    category: "OS"
  },

  {
    question: "In Round Robin scheduling, each process receives:",
    options: [
      "A fixed memory block",
      "A time quantum",
      "A priority level",
      "A dedicated core"
    ],
    correctAnswer: "A time quantum",
    difficulty: "easy",
    category: "OS"
  },

  {
    question: "Thrashing occurs when:",
    options: [
      "CPU temperature increases",
      "Too many interrupts occur",
      "Excessive page swapping happens",
      "Disk partitions overlap"
    ],
    correctAnswer: "Excessive page swapping happens",
    difficulty: "hard",
    category: "OS"
  },

  {
    question: "Which state comes immediately after a process is created?",
    options: [
      "Running",
      "Waiting",
      "Ready",
      "Terminated"
    ],
    correctAnswer: "Ready",
    difficulty: "medium",
    category: "OS"
  }
];

async function seedDB() {
  try {
    console.log("Connecting to database for seeding MCQ data...");
    await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB.");

    const testTitle = "Operating Systems Mock Test";
    
    // Find existing OS Mock Test to keep the script idempotent
    const existingTest = await McqTest.findOne({ title: testTitle });
    if (existingTest) {
      console.log(`Found existing test: "${testTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingTest._id });
      await McqTest.findByIdAndDelete(existingTest._id);
    }

    // Create the OS MCQ Test
    const newTest = await McqTest.create({
      title: testTitle,
      description: "Practice questions on Operating System concepts like scheduling, virtual memory, paging, and deadlocks.",
      category: "OS",
      duration: 15,
      totalMarks: osQuestions.length,
      passingMarks: 5,
      isActive: true
    });

    console.log(`Created MCQ Test: "${newTest.title}" with ID: ${newTest._id}`);

    // Map and insert the questions
    const questionsToInsert = osQuestions.map((q) => ({
      testId: newTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "OS"
    }));

    const insertedQuestions = await Question.insertMany(questionsToInsert);
    console.log(`Successfully seeded ${insertedQuestions.length} OS questions.`);

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDB();
