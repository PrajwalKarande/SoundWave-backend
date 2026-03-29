import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { artistCreateSchema } from "../validators/schemas.js";
import { createArtist, getAllArtists, getArtistById, searchArtistsByName, updateArtist, deleteArtist } from "../controllers/artistController.js";

const router = Router();

// Public routes
router.get("/", getAllArtists);
router.get("/search", searchArtistsByName);
router.get("/:id", getArtistById);

// Admin-only routes
router.post("/create", authenticate, authorizeAdmin, validate(artistCreateSchema), createArtist);
router.put("/update/:id", authenticate, authorizeAdmin, validate(artistCreateSchema),updateArtist);
router.delete("/delete/:id", authenticate, authorizeAdmin, deleteArtist);

export default router;