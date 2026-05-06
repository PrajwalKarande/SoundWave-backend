import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middleware/auth.js"
import { uploadSongFiles } from "../middleware/uploadSong.js"
import { validate } from "../middleware/validate.js"
import { songUploadSchema, songUpdateSchema } from "../validators/schemas.js"
import { getAllSongs, getSongById, searchSongsByTitle, uploadSong, deleteSong, updateSong, markPlayed, getRecentlyPlayed } from "../controllers/songController.js"
import { getRecommendations, getTrending } from "../controllers/recommendationController.js"

const router = Router()

// Public routes
router.get("/", authenticate,getAllSongs)
router.get("/search", authenticate,searchSongsByTitle)

// Authenticated user routes — must be declared before /:id to avoid route conflicts
router.get("/recently-played", authenticate, getRecentlyPlayed)
router.get("/recommendations", authenticate, getRecommendations)
router.get("/trending", authenticate, getTrending)
router.post("/:id/played", authenticate, markPlayed)

router.get("/:id", authenticate,getSongById)

// Admin-only routes
router.post("/upload", authenticate, authorizeAdmin, uploadSongFiles, validate(songUploadSchema), uploadSong)
router.put("/:id", authenticate, authorizeAdmin, validate(songUpdateSchema), updateSong)
router.delete("/:id", authenticate, authorizeAdmin, deleteSong)

export default router
