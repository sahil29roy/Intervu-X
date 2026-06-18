import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import { ENV } from "./src/lib/env.js";

async function run() {
    await mongoose.connect(ENV.DB_URL || "mongodb://localhost:27017/intervux");
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.updateOne({ email: "candidate@gmail.com" }, { password: hashedPassword });
    console.log("Updated candidate@gmail.com password to 'password123'");
    await mongoose.disconnect();
}

run().catch(console.error);
