import express from "express"
import path from "path"
import { ENV } from "./lib/env.js"
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = new express()

const __dirname = path.resolve();
//middleware

app.use(express.json());
//credentials true meaning : server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions })); // for handling inngest functions in express server


app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is up and running" })
})

app.get("/books", (req, res) => {
    res.status(200).json({ msg: "this is books endpoint" })
})


if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "dist", "index.js"))
    })
}



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