import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getStats } from "../controllers/statsController.js";

const router = Router()

router.get("/", authenticate, getStats)

export default router
