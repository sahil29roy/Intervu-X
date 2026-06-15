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

export const oopsQuestions = [
  {
    question: "Which OOP concept allows data and methods to be bundled together?",
    options: [
      "Inheritance",
      "Polymorphism",
      "Encapsulation",
      "Abstraction"
    ],
    correctAnswer: "Encapsulation",
    difficulty: "easy",
    category: "OOPS"
  },

  {
    question: "An object is an instance of a:",
    options: [
      "Method",
      "Class",
      "Package",
      "Interface"
    ],
    correctAnswer: "Class",
    difficulty: "easy",
    category: "OOPS"
  },

  {
    question: "Which feature enables code reusability in OOP?",
    options: [
      "Inheritance",
      "Encapsulation",
      "Binding",
      "Abstraction"
    ],
    correctAnswer: "Inheritance",
    difficulty: "easy",
    category: "OOPS"
  },

  {
    question: "What is compile-time polymorphism commonly achieved through?",
    options: [
      "Method Overriding",
      "Virtual Functions",
      "Method Overloading",
      "Inheritance"
    ],
    correctAnswer: "Method Overloading",
    difficulty: "medium",
    category: "OOPS"
  },

  {
    question: "Which keyword is used to create an object in Java?",
    options: [
      "this",
      "new",
      "create",
      "object"
    ],
    correctAnswer: "new",
    difficulty: "easy",
    category: "OOPS"
  },

  {
    question: "Method overriding is associated with:",
    options: [
      "Runtime Polymorphism",
      "Encapsulation",
      "Data Hiding",
      "Aggregation"
    ],
    correctAnswer: "Runtime Polymorphism",
    difficulty: "medium",
    category: "OOPS"
  },

  {
    question: "Which access modifier provides the highest level of data hiding?",
    options: [
      "public",
      "protected",
      "default",
      "private"
    ],
    correctAnswer: "private",
    difficulty: "medium",
    category: "OOPS"
  },

  {
    question: "Abstraction focuses on:",
    options: [
      "Showing implementation details",
      "Reducing object creation",
      "Hiding unnecessary details",
      "Increasing inheritance levels"
    ],
    correctAnswer: "Hiding unnecessary details",
    difficulty: "medium",
    category: "OOPS"
  },

  {
    question: "Which type of inheritance is not directly supported in Java through classes?",
    options: [
      "Single",
      "Hierarchical",
      "Multiple",
      "Multilevel"
    ],
    correctAnswer: "Multiple",
    difficulty: "hard",
    category: "OOPS"
  },

  {
    question: "A constructor is primarily used to:",
    options: [
      "Delete objects",
      "Initialize objects",
      "Hide data members",
      "Override methods"
    ],
    correctAnswer: "Initialize objects",
    difficulty: "easy",
    category: "OOPS"
  }
];

export const cnQuestions = [
  {
    question: "Which layer of the OSI model is responsible for routing packets?",
    options: [
      "Transport Layer",
      "Network Layer",
      "Data Link Layer",
      "Session Layer"
    ],
    correctAnswer: "Network Layer",
    difficulty: "easy",
    category: "CN"
  },

  {
    question: "Which protocol is primarily used for transferring web pages?",
    options: [
      "FTP",
      "SMTP",
      "HTTP",
      "SNMP"
    ],
    correctAnswer: "HTTP",
    difficulty: "easy",
    category: "CN"
  },

  {
    question: "What is the default port number for HTTPS?",
    options: [
      "21",
      "80",
      "443",
      "8080"
    ],
    correctAnswer: "443",
    difficulty: "easy",
    category: "CN"
  },

  {
    question: "Which device operates primarily at the Data Link Layer?",
    options: [
      "Router",
      "Gateway",
      "Switch",
      "Repeater"
    ],
    correctAnswer: "Switch",
    difficulty: "medium",
    category: "CN"
  },

  {
    question: "TCP is considered reliable because it provides:",
    options: [
      "Encryption",
      "Broadcasting",
      "Error Recovery",
      "Compression"
    ],
    correctAnswer: "Error Recovery",
    difficulty: "medium",
    category: "CN"
  },

  {
    question: "Which protocol is used to automatically assign IP addresses?",
    options: [
      "ARP",
      "DHCP",
      "ICMP",
      "DNS"
    ],
    correctAnswer: "DHCP",
    difficulty: "easy",
    category: "CN"
  },

  {
    question: "What is the primary purpose of DNS?",
    options: [
      "Assign MAC addresses",
      "Translate domain names",
      "Encrypt packets",
      "Route traffic"
    ],
    correctAnswer: "Translate domain names",
    difficulty: "easy",
    category: "CN"
  },

  {
    question: "Which TCP flag is used to establish a connection?",
    options: [
      "ACK",
      "FIN",
      "RST",
      "SYN"
    ],
    correctAnswer: "SYN",
    difficulty: "medium",
    category: "CN"
  },

  {
    question: "Which protocol is connectionless?",
    options: [
      "TCP",
      "UDP",
      "FTP",
      "SSH"
    ],
    correctAnswer: "UDP",
    difficulty: "medium",
    category: "CN"
  },

  {
    question: "A subnet mask is primarily used to:",
    options: [
      "Identify network boundaries",
      "Encrypt network traffic",
      "Increase bandwidth",
      "Detect packet loss"
    ],
    correctAnswer: "Identify network boundaries",
    difficulty: "hard",
    category: "CN"
  }
];

export const dsaQuestions = [
  {
    question: "What is the time complexity of binary search on a sorted array?",
    options: [
      "O(n)",
      "O(log n)",
      "O(n log n)",
      "O(1)"
    ],
    correctAnswer: "O(log n)",
    difficulty: "easy",
    category: "DSA"
  },

  {
    question: "Which data structure follows the LIFO principle?",
    options: [
      "Queue",
      "Heap",
      "Stack",
      "Graph"
    ],
    correctAnswer: "Stack",
    difficulty: "easy",
    category: "DSA"
  },

  {
    question: "Which traversal visits nodes in the order Left → Root → Right?",
    options: [
      "Preorder",
      "Postorder",
      "Level Order",
      "Inorder"
    ],
    correctAnswer: "Inorder",
    difficulty: "easy",
    category: "DSA"
  },

  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: [
      "Bubble Sort",
      "Insertion Sort",
      "Merge Sort",
      "Selection Sort"
    ],
    correctAnswer: "Merge Sort",
    difficulty: "medium",
    category: "DSA"
  },

  {
    question: "Which data structure is commonly used for implementing BFS?",
    options: [
      "Stack",
      "Queue",
      "Heap",
      "Array"
    ],
    correctAnswer: "Queue",
    difficulty: "medium",
    category: "DSA"
  },

  {
    question: "What is the worst-case time complexity of Quick Sort?",
    options: [
      "O(log n)",
      "O(n log n)",
      "O(n²)",
      "O(n)"
    ],
    correctAnswer: "O(n²)",
    difficulty: "medium",
    category: "DSA"
  },

  {
    question: "Which data structure is most suitable for implementing a priority queue?",
    options: [
      "Linked List",
      "Stack",
      "Heap",
      "Queue"
    ],
    correctAnswer: "Heap",
    difficulty: "medium",
    category: "DSA"
  },

  {
    question: "Which graph algorithm is used to find the shortest path in a graph with non-negative weights?",
    options: [
      "Kruskal",
      "Prim",
      "Dijkstra",
      "DFS"
    ],
    correctAnswer: "Dijkstra",
    difficulty: "hard",
    category: "DSA"
  },

  {
    question: "In a balanced Binary Search Tree, search operation takes:",
    options: [
      "O(log n)",
      "O(n)",
      "O(n log n)",
      "O(1)"
    ],
    correctAnswer: "O(log n)",
    difficulty: "medium",
    category: "DSA"
  },

  {
    question: "Dynamic Programming is mainly used when a problem has:",
    options: [
      "Unique solutions only",
      "Overlapping subproblems",
      "No recursion",
      "Sorted input"
    ],
    correctAnswer: "Overlapping subproblems",
    difficulty: "hard",
    category: "DSA"
  }
];

export const aptitudeQuestions = [
  {
    question: "A number is increased by 20% and becomes 120. What was the original number?",
    options: [
      "90",
      "100",
      "110",
      "80"
    ],
    correctAnswer: "100",
    difficulty: "easy",
    category: "APTITUDE"
  },

  {
    question: "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?",
    options: [
      "15",
      "20",
      "25",
      "18"
    ],
    correctAnswer: "20",
    difficulty: "easy",
    category: "APTITUDE"
  },

  {
    question: "A shopkeeper buys an item for ₹800 and sells it for ₹920. What is the profit percentage?",
    options: [
      "10%",
      "12%",
      "15%",
      "20%"
    ],
    correctAnswer: "15%",
    difficulty: "medium",
    category: "APTITUDE"
  },

  {
    question: "A train travels 180 km in 3 hours. What is its average speed?",
    options: [
      "50 km/h",
      "55 km/h",
      "60 km/h",
      "65 km/h"
    ],
    correctAnswer: "60 km/h",
    difficulty: "easy",
    category: "APTITUDE"
  },

  {
    question: "The average of 10, 20, 30, 40 and 50 is:",
    options: [
      "25",
      "30",
      "35",
      "40"
    ],
    correctAnswer: "30",
    difficulty: "easy",
    category: "APTITUDE"
  },

  {
    question: "A can complete a work in 12 days. B can complete the same work in 18 days. Together they will complete it in:",
    options: [
      "6 days",
      "7.2 days",
      "8 days",
      "9 days"
    ],
    correctAnswer: "7.2 days",
    difficulty: "medium",
    category: "APTITUDE"
  },

  {
    question: "Simple interest on ₹5000 at 8% per annum for 2 years is:",
    options: [
      "₹600",
      "₹700",
      "₹800",
      "₹900"
    ],
    correctAnswer: "₹800",
    difficulty: "medium",
    category: "APTITUDE"
  },

  {
    question: "A bag contains 3 red and 2 blue balls. What is the probability of drawing a blue ball?",
    options: [
      "1/5",
      "2/5",
      "3/5",
      "4/5"
    ],
    correctAnswer: "2/5",
    difficulty: "medium",
    category: "APTITUDE"
  },

  {
    question: "How many different arrangements can be made using the letters of the word 'CAT'?",
    options: [
      "3",
      "6",
      "9",
      "12"
    ],
    correctAnswer: "6",
    difficulty: "hard",
    category: "APTITUDE"
  },

  {
    question: "The compound interest on ₹1000 at 10% per annum for 2 years is:",
    options: [
      "₹200",
      "₹210",
      "₹220",
      "₹230"
    ],
    correctAnswer: "₹210",
    difficulty: "hard",
    category: "APTITUDE"
  }
];

export const javascriptQuestions = [
  {
    question: "Which keyword declares a block-scoped variable?",
    options: [
      "var",
      "let",
      "const",
      "Both let and const"
    ],
    correctAnswer: "Both let and const",
    difficulty: "easy",
    category: "JavaScript"
  },

  {
    question: "What will typeof null return?",
    options: [
      "null",
      "object",
      "undefined",
      "number"
    ],
    correctAnswer: "object",
    difficulty: "medium",
    category: "JavaScript"
  },

  {
    question: "Which method creates a new array without modifying the original array?",
    options: [
      "splice()",
      "push()",
      "slice()",
      "pop()"
    ],
    correctAnswer: "slice()",
    difficulty: "easy",
    category: "JavaScript"
  },

  {
    question: "Which of the following is NOT a JavaScript primitive type?",
    options: [
      "string",
      "number",
      "object",
      "boolean"
    ],
    correctAnswer: "object",
    difficulty: "easy",
    category: "JavaScript"
  },

  {
    question: "What is the output of: Boolean('0')?",
    options: [
      "false",
      "0",
      "true",
      "undefined"
    ],
    correctAnswer: "true",
    difficulty: "medium",
    category: "JavaScript"
  },

  {
    question: "Which keyword is used to handle errors in JavaScript?",
    options: [
      "catch",
      "throw",
      "try",
      "try...catch"
    ],
    correctAnswer: "try...catch",
    difficulty: "easy",
    category: "JavaScript"
  },

  {
    question: "What is a closure in JavaScript?",
    options: [
      "A loop statement",
      "A function with access to outer scope",
      "A type of object",
      "A built-in method"
    ],
    correctAnswer: "A function with access to outer scope",
    difficulty: "hard",
    category: "JavaScript"
  },

  {
    question: "Which method converts a JSON string into a JavaScript object?",
    options: [
      "JSON.stringify()",
      "JSON.convert()",
      "JSON.parse()",
      "JSON.object()"
    ],
    correctAnswer: "JSON.parse()",
    difficulty: "easy",
    category: "JavaScript"
  },

  {
    question: "Promises can be in how many states?",
    options: [
      "2",
      "3",
      "4",
      "5"
    ],
    correctAnswer: "3",
    difficulty: "medium",
    category: "JavaScript"
  },

  {
    question: "Which queue is used by JavaScript to execute callback functions after the call stack is empty?",
    options: [
      "Memory Queue",
      "Execution Queue",
      "Event Queue",
      "Object Queue"
    ],
    correctAnswer: "Event Queue",
    difficulty: "hard",
    category: "JavaScript"
  }
];

async function seedDB() {
  try {
    console.log("Connecting to database for seeding MCQ data...");
    await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB.");

    // --- SEED OPERATING SYSTEMS TEST ---
    const osTestTitle = "Operating Systems Mock Test";
    const existingOsTest = await McqTest.findOne({ title: osTestTitle });
    if (existingOsTest) {
      console.log(`Found existing test: "${osTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingOsTest._id });
      await McqTest.findByIdAndDelete(existingOsTest._id);
    }

    const newOsTest = await McqTest.create({
      title: osTestTitle,
      description: "Practice questions on Operating System concepts like scheduling, virtual memory, paging, and deadlocks.",
      category: "OS",
      duration: 15,
      totalMarks: osQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newOsTest.title}" with ID: ${newOsTest._id}`);

    const osQuestionsToInsert = osQuestions.map((q) => ({
      testId: newOsTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "OS"
    }));
    const insertedOsQuestions = await Question.insertMany(osQuestionsToInsert);
    console.log(`Successfully seeded ${insertedOsQuestions.length} OS questions.`);

    // --- SEED OOPS TEST ---
    const oopsTestTitle = "Object-Oriented Programming (OOP) Mock Test";
    const existingOopsTest = await McqTest.findOne({ title: oopsTestTitle });
    if (existingOopsTest) {
      console.log(`Found existing test: "${oopsTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingOopsTest._id });
      await McqTest.findByIdAndDelete(existingOopsTest._id);
    }

    const newOopsTest = await McqTest.create({
      title: oopsTestTitle,
      description: "Practice questions on Object-Oriented Programming concepts like classes, inheritance, polymorphism, encapsulation, and abstraction.",
      category: "OOPS",
      duration: 15,
      totalMarks: oopsQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newOopsTest.title}" with ID: ${newOopsTest._id}`);

    const oopsQuestionsToInsert = oopsQuestions.map((q) => ({
      testId: newOopsTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "OOPS"
    }));
    const insertedOopsQuestions = await Question.insertMany(oopsQuestionsToInsert);
    console.log(`Successfully seeded ${insertedOopsQuestions.length} OOPS questions.`);

    // --- SEED CN TEST ---
    const cnTestTitle = "Computer Networks (CN) Mock Test";
    const existingCnTest = await McqTest.findOne({ title: cnTestTitle });
    if (existingCnTest) {
      console.log(`Found existing test: "${cnTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingCnTest._id });
      await McqTest.findByIdAndDelete(existingCnTest._id);
    }

    const newCnTest = await McqTest.create({
      title: cnTestTitle,
      description: "Practice questions on Computer Networks concepts like the OSI model, HTTP/HTTPS protocols, TCP/UDP, DNS, and IP subnetting.",
      category: "CN",
      duration: 15,
      totalMarks: cnQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newCnTest.title}" with ID: ${newCnTest._id}`);

    const cnQuestionsToInsert = cnQuestions.map((q) => ({
      testId: newCnTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "CN"
    }));
    const insertedCnQuestions = await Question.insertMany(cnQuestionsToInsert);
    console.log(`Successfully seeded ${insertedCnQuestions.length} CN questions.`);

    // --- SEED DSA TEST ---
    const dsaTestTitle = "Data Structures and Algorithms (DSA) Mock Test";
    const existingDsaTest = await McqTest.findOne({ title: dsaTestTitle });
    if (existingDsaTest) {
      console.log(`Found existing test: "${dsaTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingDsaTest._id });
      await McqTest.findByIdAndDelete(existingDsaTest._id);
    }

    const newDsaTest = await McqTest.create({
      title: dsaTestTitle,
      description: "Practice questions on Data Structures and Algorithms concepts like time complexity, binary search, stacks/queues, trees, heaps, sorting algorithms, and dynamic programming.",
      category: "DSA",
      duration: 15,
      totalMarks: dsaQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newDsaTest.title}" with ID: ${newDsaTest._id}`);

    const dsaQuestionsToInsert = dsaQuestions.map((q) => ({
      testId: newDsaTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "DSA"
    }));
    const insertedDsaQuestions = await Question.insertMany(dsaQuestionsToInsert);
    console.log(`Successfully seeded ${insertedDsaQuestions.length} DSA questions.`);

    // --- SEED APTITUDE TEST ---
    const aptitudeTestTitle = "Quantitative Aptitude Mock Test";
    const existingAptitudeTest = await McqTest.findOne({ title: aptitudeTestTitle });
    if (existingAptitudeTest) {
      console.log(`Found existing test: "${aptitudeTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingAptitudeTest._id });
      await McqTest.findByIdAndDelete(existingAptitudeTest._id);
    }

    const newAptitudeTest = await McqTest.create({
      title: aptitudeTestTitle,
      description: "Practice questions on Quantitative Aptitude concepts like percentages, ratios, profit & loss, speed & distance, work & time, simple & compound interest, probability, and permutations.",
      category: "APTITUDE",
      duration: 15,
      totalMarks: aptitudeQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newAptitudeTest.title}" with ID: ${newAptitudeTest._id}`);

    const aptitudeQuestionsToInsert = aptitudeQuestions.map((q) => ({
      testId: newAptitudeTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "APTITUDE"
    }));
    const insertedAptitudeQuestions = await Question.insertMany(aptitudeQuestionsToInsert);
    console.log(`Successfully seeded ${insertedAptitudeQuestions.length} Aptitude questions.`);

    // --- SEED JAVASCRIPT TEST ---
    const jsTestTitle = "JavaScript Programming Mock Test";
    const existingJsTest = await McqTest.findOne({ title: jsTestTitle });
    if (existingJsTest) {
      console.log(`Found existing test: "${jsTestTitle}". Deleting it and its questions to re-seed...`);
      await Question.deleteMany({ testId: existingJsTest._id });
      await McqTest.findByIdAndDelete(existingJsTest._id);
    }

    const newJsTest = await McqTest.create({
      title: jsTestTitle,
      description: "Practice questions on JavaScript fundamentals like closures, hoisting, promises, data types, and execution environment.",
      category: "JavaScript",
      duration: 15,
      totalMarks: javascriptQuestions.length,
      passingMarks: 5,
      isActive: true
    });
    console.log(`Created MCQ Test: "${newJsTest.title}" with ID: ${newJsTest._id}`);

    const jsQuestionsToInsert = javascriptQuestions.map((q) => ({
      testId: newJsTest._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.category || "JavaScript"
    }));
    const insertedJsQuestions = await Question.insertMany(jsQuestionsToInsert);
    console.log(`Successfully seeded ${insertedJsQuestions.length} JavaScript questions.`);

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDB();


