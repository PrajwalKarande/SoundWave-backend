import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { likeSongSchema } from "../validators/schemas.js"
import {
    likeSong,
    unlikeSong,
    getLikedSongs,
    getLikedSongIds,
    checkLiked,
} from "../controllers/likedSongController.js"

const router = Router()

router.get("/", authenticate, getLikedSongs)
// /ids must be declared before /:songId to avoid Express matching "ids" as a param
router.get("/ids", authenticate, getLikedSongIds)
router.get("/:songId", authenticate, checkLiked)
router.post("/", authenticate, validate(likeSongSchema), likeSong)
router.delete("/:songId", authenticate, unlikeSong)

export default router
