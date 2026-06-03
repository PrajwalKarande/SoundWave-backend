import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { artistCreateSchema, artistUpdateSchema } from "../validators/schemas.js";
import { createArtist, getAllArtists, getArtistById, searchArtistsByName, updateArtist, deleteArtist } from "../controllers/artistController.js";

const router = Router();

// Public routes
router.get("/", getAllArtists);
router.get("/search", searchArtistsByName);
router.get("/:id", getArtistById);

// Admin-only routes ->  route level middleware 
router.post("/create", authenticate, authorizeAdmin, validate(artistCreateSchema), createArtist);
router.put("/update/:id", authenticate, authorizeAdmin, validate(artistUpdateSchema), updateArtist);
router.delete("/delete/:id", authenticate, authorizeAdmin, deleteArtist);

export default router;