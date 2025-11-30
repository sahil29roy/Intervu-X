import express from "express"
import { ENV } from "./lib/env.js"
const app = new express()



app.get("/", (req, res) => {
    res.status(200).json({msg:"success from backend"})
})

app.listen(ENV.PORT,()=> console.log("server is running on port ",ENV.PORT));