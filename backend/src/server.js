import express from "express"
import path from "path"
import { ENV } from "./lib/env.js"
import { connectDB } from "./lib/db.js";

const app = new express()

const __dirname = path.resolve();

app.use(express.json());

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