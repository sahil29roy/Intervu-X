import express from "express"
import path from "path"
import cors from "cors"
import { ENV } from "./lib/env.js"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/authRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import testRoutes from "./routes/testRoutes.js"
import codingRoutes from "./routes/codingRoutes.js"
import { redis } from "./lib/redis.js"

const app = new express()

const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: ENV.CLIENT_URL || "*",
    credentials: true
}));

// Serve static files from the uploads directory
app.use("/uploads", express.static("public/uploads"));

// Route Definitions
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/coding", codingRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is up and running" })
})

app.get("/books", (req, res) => {
    res.status(200).json({ msg: "this is books endpoint" })
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log("server is running on port ", ENV.PORT)
        });
    } catch (err) {
        console.error("failed to start server ", err.message)
    }
}

startServer();