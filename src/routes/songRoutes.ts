import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middleware/auth.js"
import { uploadSongFiles } from "../middleware/upload.js"
import { getAllSongs, getSongById, uploadSong, deleteSong } from "../controllers/songController.js"

const router = Router()

// Public routes
router.get("/", getAllSongs)
router.get("/:id", getSongById)

// Admin-only routes
router.post("/upload", authenticate, authorizeAdmin, uploadSongFiles, uploadSong)
router.delete("/:id", authenticate, authorizeAdmin, deleteSong)

export default router
