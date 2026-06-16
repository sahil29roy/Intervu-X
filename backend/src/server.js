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

// ── Socket.io Real-time Logic ──

// In-memory room state: Map<roomId, { candidate: socketId, interviewer: socketId }>
const rooms = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ── Join Room ──
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

        // Notify others in the room that someone joined (legacy)
        socket.to(roomId).emit("user-joined", { role, userName });
    });

    // ── Chat ──
    socket.on("chat-message", ({ roomId, message }) => {
        socket.to(roomId).emit("chat-message", message);
    });

    // ── Code Sync (Candidate → Interviewer) ──
    socket.on("code-update", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);
    });

    // ── MCQ Sync (Candidate → Interviewer) ──
    socket.on("mcq-update", ({ roomId, optionId }) => {
        socket.to(roomId).emit("mcq-update", optionId);
    });

    // ── Candidate Activity Feed ──
    socket.on("candidate-activity", ({ roomId, activity }) => {
        socket.to(roomId).emit("candidate-activity", activity);
    });

    // ── WebRTC Signaling ──
    socket.on("webrtc-offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("webrtc-offer", offer);
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("webrtc-answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("ice-candidate", candidate);
    });

    // ── Screen Share Notifications ──
    socket.on("screen-share-start", ({ roomId }) => {
        socket.to(roomId).emit("screen-share-start");
    });

    socket.on("screen-share-stop", ({ roomId }) => {
        socket.to(roomId).emit("screen-share-stop");
    });

    // ── Disconnect ──
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