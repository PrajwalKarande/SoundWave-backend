import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { createArtist, getAllArtists, getArtistById, searchArtistsByName, updateArtist, deleteArtist } from "../controllers/artistController.js";

const router = Router();

// Public routes
router.get("/", getAllArtists);
router.get("/search", searchArtistsByName);
router.get("/:id", getArtistById);

// Admin-only routes
router.post("/create", authenticate, authorizeAdmin, createArtist);
router.put("/update/:id", authenticate, authorizeAdmin, updateArtist);
router.delete("/delete/:id", authenticate, authorizeAdmin, deleteArtist);

export default router;