import { Router } from "express"
import { login, registerUser, validateToken } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()

router.post("/signup",registerUser)
router.post("/login",login)
router.get("/validate", authenticate, validateToken)

export default router