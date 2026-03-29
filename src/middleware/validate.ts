import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

export const validate = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const errors = result.error.issues.map((e) => ({
                field: e.path.map(String).join("."),
                message: e.message,
            }))

            res.status(400).json({ message: errors })
            return
        }

        next()
    }
}
