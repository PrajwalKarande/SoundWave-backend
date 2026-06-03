import { config } from "dotenv";
config()

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statRoutes from "./routes/statRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js"
import likedSongRoutes from "./routes/likedSongRoutes.js"

connectDB()

const app = express()

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
}))

app.use(cookieParser())
app.use(express.json())

//Routes
app.use("/api/auth",authRoutes)
app.use("/api/songs",songRoutes)
app.use("/api/artists",artistRoutes)
app.use("/api/users",userRoutes)
app.use("/api/stats",statRoutes)
app.use('/api/playlists',playlistRoutes)
app.use('/api/liked',likedSongRoutes)

const port = Number(process.env.PORT) || 3000

// app.listen(port,'0.0.0.0',()=>{
//     console.log(`Server is running on port ${port}`)
// })

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})