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
import notificationRoutes from "./routes/notificationRoutes.js"
import { redis } from "./lib/redis.js"

const app = express()
const httpServer = createServer(app)

const allowedOrigins = [
    ENV.CLIENT_URL,
    "https://intervu-x.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.endsWith(".vercel.app")) return true;
    return false;
};

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"]
    }
})

global.io = io; // Share socket server globally

const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use("/uploads", express.static("public/uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is up and running" })
})

app.get("/books", (req, res) => {
    res.status(200).json({ msg: "this is books endpoint" })
})

// Socket.io

// In-memory room state: Map<roomId, { candidate: socketId, interviewer: socketId }>
const rooms = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register user socket room for real-time notifications
    socket.on("register-user", (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`Socket ${socket.id} registered and joined room: ${userId}`);
        }
    });

    //Join Room 
    socket.on("join-room", ({ roomId, role, userName }) => {
        socket.join(roomId);
        socket.data = { roomId, role, userName };

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { candidate: null, interviewer: null });
        }

        const room = rooms.get(roomId);
        room[role] = { socketId: socket.id, userName };

        console.log(`[Room ${roomId}] ${role} "${userName}" joined (${socket.id})`);

        // Broadcast updated participant list to everyone in the room
        const statusPayload = {
            roomId,
            interviewerOnline: !!room.interviewer,
            candidateOnline: !!room.candidate,
            participantCount: (room.interviewer ? 1 : 0) + (room.candidate ? 1 : 0)
        };
        io.to(roomId).emit("participant-status", statusPayload);

        // Notify others in the room that someone joined 
        socket.to(roomId).emit("user-joined", { role, userName });
    });

    //chat 
    socket.on("chat-message", ({ roomId, message }) => {
        socket.to(roomId).emit("chat-message", message);
    });

    // Code Sync (Candidate → Interviewer)
    socket.on("code-update", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);
    });

    // MCQ Sync (Candidate → Interviewer)
    socket.on("mcq-update", ({ roomId, optionId }) => {
        socket.to(roomId).emit("mcq-update", optionId);
    });

    //Candidate Activity Feed
    socket.on("candidate-activity", ({ roomId, activity }) => {
        socket.to(roomId).emit("candidate-activity", activity);
    });

    // WebRTC Signaling
    socket.on("webrtc-offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("webrtc-offer", offer);
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("webrtc-answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("ice-candidate", candidate);
    });

    // Screen Share Notifications 
    socket.on("screen-share-start", ({ roomId }) => {
        socket.to(roomId).emit("screen-share-start");
    });

    socket.on("screen-share-stop", ({ roomId }) => {
        socket.to(roomId).emit("screen-share-stop");
    });

    // Disconnect 
    socket.on("disconnect", () => {
        const { roomId, role, userName } = socket.data || {};
        if (roomId && rooms.has(roomId)) {
            const room = rooms.get(roomId);
            if (room[role]?.socketId === socket.id) {
                room[role] = null;
            }
            // Broadcast updated participant list
            const statusPayload = {
                roomId,
                interviewerOnline: !!room.interviewer,
                candidateOnline: !!room.candidate,
                participantCount: (room.interviewer ? 1 : 0) + (room.candidate ? 1 : 0)
            };
            io.to(roomId).emit("participant-status", statusPayload);

            // Clean up empty rooms
            if (!room.candidate && !room.interviewer) {
                rooms.delete(roomId);
                console.log(`[Room ${roomId}] DELETED — empty`);
            }
        }
        console.log("Socket disconnected:", socket.id);
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