import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import type { Request } from "express"
import type { AuthRequest } from "./auth.js"

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many authentication attempts, please try again later." },
})

export const playbackLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req: Request) => (req as AuthRequest).user?.id || ipKeyGenerator(req),
    message: { message: "Playback limit reached, please try again later." },
})
