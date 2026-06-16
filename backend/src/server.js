import express from "express"
import path from "path"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { ENV } from "./lib/env.js"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/authRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import testRoutes from "./routes/testRoutes.js"
import codingRoutes from "./routes/codingRoutes.js"
import { redis } from "./lib/redis.js"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: ENV.CLIENT_URL || "*",
        methods: ["GET", "POST"]
    }
})

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

// Socket.io Real-time Logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-interview", (interviewId) => {
        socket.join(interviewId);
        console.log(`Socket ${socket.id} joined interview room ${interviewId}`);
    });

    socket.on("chat-message", ({ interviewId, message }) => {
        socket.to(interviewId).emit("chat-message", message);
    });

    socket.on("code-update", ({ interviewId, code }) => {
        socket.to(interviewId).emit("code-update", code);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(ENV.PORT, () => {
            console.log("server is running on port ", ENV.PORT)
        });
    } catch (err) {
        console.error("failed to start server ", err.message)
    }
}

startServer();