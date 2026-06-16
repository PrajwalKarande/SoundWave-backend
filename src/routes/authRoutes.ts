import { Router } from "express"
import { login, logout, registerUser, validateToken } from "../controllers/authController.js"
import { authenticate, authorizeAdmin } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { userLoginSchema, userRegisterSchema } from "../validators/schemas.js"
import { authLimiter } from "../middleware/rateLimiter.js"

const router = Router()

router.post("/signup", authLimiter, authenticate, authorizeAdmin, validate(userRegisterSchema), registerUser)
router.post("/login", authLimiter, validate(userLoginSchema), login)
router.post("/logout", logout)
router.get("/validate", authenticate, validateToken)

export default router