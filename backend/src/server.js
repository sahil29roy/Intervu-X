import express from "express"
import path from "path"
import { ENV } from "./lib/env.js"

const app = new express()

const __dirname = path.resolve();


app.get("/health", (req, res) => {
    res.status(200).json({msg:"api is up and running"})
})

app.get("/books", (req, res) => {
    res.status(200).json({msg:"this is books endpoint"})
})


if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist","dist","index.js"))
    })
}

app.listen(ENV.PORT,()=> console.log("server is running on port ",ENV.PORT));