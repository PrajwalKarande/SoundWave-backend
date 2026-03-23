import { config } from "dotenv";
config()

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

connectDB()

const app = express()

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
}))

app.use(express.json())

//Routes







const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})