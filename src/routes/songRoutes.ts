import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middleware/auth.js"
import { uploadSongFiles } from "../middleware/uploadSong.js"
import { validate } from "../middleware/validate.js"
import { songUploadSchema } from "../validators/schemas.js"
import { getAllSongs, getSongById, searchSongsByTitle, uploadSong, deleteSong, markPlayed, getRecentlyPlayed } from "../controllers/songController.js"

const router = Router()

// Public routes
router.get("/", getAllSongs)
router.get("/search", searchSongsByTitle)

// Authenticated user routes — must be declared before /:id to avoid route conflicts
router.get("/recently-played", authenticate, getRecentlyPlayed)
router.post("/:id/played", authenticate, markPlayed)

router.get("/:id", getSongById)

// Admin-only routes
router.post("/upload", authenticate, authorizeAdmin, uploadSongFiles, validate(songUploadSchema), uploadSong)
router.delete("/:id", authenticate, authorizeAdmin, deleteSong)

export default router
