import { z } from "zod"

export const userRegisterSchema = z.object({
    username: z.string().min(3,"Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})

export const userLoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})
