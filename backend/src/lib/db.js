import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log(`MongoDB connected: ${conn.connection.host}`)

    }catch(err){
        console.error(`Error: ${err.message}`)
        process.exit(1) // 0 means success , 1 mens failure
    }
}