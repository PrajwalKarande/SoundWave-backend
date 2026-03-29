import { Router } from "express";
import { changeUserRole, deleteUser, getAllUsers } from "../controllers/userController.js";
import { authenticate,authorizeAdmin } from "../middleware/auth.js";

const router = Router()

router.get("/", authenticate,authorizeAdmin, getAllUsers)
router.delete("/:id", authenticate,authorizeAdmin, deleteUser)
router.put("/:id/role", authenticate,authorizeAdmin, changeUserRole)

export default router