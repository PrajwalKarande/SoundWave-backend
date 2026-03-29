import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { getStats } from "../controllers/statsController.js";

const router = Router()

router.get("/", authenticate,authorizeAdmin, getStats)

export default router
