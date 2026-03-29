import { Router } from "express"
import { login, registerUser, validateToken } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { userLoginSchema, userRegisterSchema } from "../validators/schemas.js"

const router = Router()

router.post("/signup", validate(userRegisterSchema), registerUser)
router.post("/login", validate(userLoginSchema), login)
router.get("/validate", authenticate, validateToken)

export default router