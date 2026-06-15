import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import CodingQuestion from "./models/CodingQuestion.js";

const mockCodingQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input has exactly one solution.

The inputs are fed as a JSON string containing the nums array and the target integer.
Example input format:
{"nums":[2,7,11,15],"target":9}

Example output format:
[0,1]`,
    difficulty: "easy",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    sampleInput: JSON.stringify({
      nums: [2, 7, 11, 15],
      target: 9
    }),
    sampleOutput: "[0,1]",
    hiddenTestCases: [
      {
        input: JSON.stringify({
          nums: [2, 7, 11, 15],
          target: 9
        }),
        output: "[0,1]"
      },
      {
        input: JSON.stringify({
          nums: [3, 2, 4],
          target: 6
        }),
        output: "[1,2]"
      },
      {
        input: JSON.stringify({
          nums: [3, 3],
          target: 6
        }),
        output: "[0,1]"
      }
    ],
    tags: ["Array", "Hash Table"]
  },
  {
    title: "Sum of Two Numbers",
    description: "Read two integers from standard input line-by-line and print their sum to standard output.",
    difficulty: "easy",
    constraints: "-10^9 <= a, b <= 10^9",
    sampleInput: "5\n10",
    sampleOutput: "15",
    hiddenTestCases: [
      { input: "2\n3", output: "5" },
      { input: "100\n-50", output: "50" },
      { input: "0\n0", output: "0" }
    ],
    tags: ["Basic", "Math"]
  },
  {
    title: "Palindrome Check",
    description: "Check if a given string read from standard input is a palindrome (reads the same forwards and backwards). Print 'true' if it is a palindrome, or 'false' otherwise.",
    difficulty: "easy",
    constraints: "String length will be between 1 and 1000.",
    sampleInput: "racecar",
    sampleOutput: "true",
    hiddenTestCases: [
      { input: "racecar", output: "true" },
      { input: "hello", output: "false" },
      { input: "a", output: "true" },
      { input: "Madam", output: "false" }
    ],
    tags: ["String", "Basic"]
  },
  {
    title: "Reverse String",
    description: "Given a string s read from standard input, return the reversed string printed to standard output.",
    difficulty: "easy",
    constraints: "String length will be between 1 and 10^5.",
    sampleInput: "hello",
    sampleOutput: "olleh",
    hiddenTestCases: [
      { input: "hello", output: "olleh" },
      { input: "intervux", output: "xuvretni" },
      { input: "Deoghar", output: "rahgoeD" }
    ],
    tags: ["String", "Basic"]
  }
];

async function seedCodingQuestions() {
  try {
    console.log("Connecting to database for seeding coding questions...");
    await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB.");

    for (const mockQ of mockCodingQuestions) {
      // Find and delete existing question by title to avoid duplicates
      const existing = await CodingQuestion.findOne({ title: mockQ.title });
      if (existing) {
        console.log(`Deleting existing question: "${mockQ.title}"...`);
        await CodingQuestion.findByIdAndDelete(existing._id);
      }

      const created = await CodingQuestion.create(mockQ);
      console.log(`Successfully seeded coding question: "${created.title}" with ID: ${created._id}`);
    }

    console.log("Database seeding of coding questions completed successfully.");
  } catch (error) {
    console.error("Error seeding coding questions:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedCodingQuestions();
