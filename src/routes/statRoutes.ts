import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { getStats, getR2Stats } from "../controllers/statsController.js";

const router = Router()

router.get("/", getStats)
router.get("/r2", authenticate, authorizeAdmin, getR2Stats)

export default router
