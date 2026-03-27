import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middleware/auth.js"
import { uploadSongFiles } from "../middleware/uploadSong.js"
import { getAllSongs, getSongById, searchSongsByTitle, uploadSong, deleteSong } from "../controllers/songController.js"

const router = Router()

// Public routes
router.get("/", getAllSongs)
router.get("/search", searchSongsByTitle)
router.get("/:id", getSongById)

// Admin-only routes
router.post("/upload", authenticate, authorizeAdmin, uploadSongFiles, uploadSong)
router.delete("/:id", authenticate, authorizeAdmin, deleteSong)

export default router
