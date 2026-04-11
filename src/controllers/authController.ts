import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import { User } from "../Models/User.js"
import { generateToken } from "../Utils/jwt.js"
import type { AuthRequest } from "../middleware/auth.js"

const COOKIE_OPTIONS = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    sameSite: "lax" as const,
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body

    try {
        const existingUser = await User.findOne({ email }).select('-__v')
        if (existingUser) {
            res.status(400).json({ message: "User Already exists, Please login" })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })

        const token = generateToken(user._id.toString(), user.role)

        res.cookie("token", token, COOKIE_OPTIONS)
        res.status(201).json({
            message: "User created successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email }).select('-__v')
        if (!user) {
            console.log("User not found")
            res.status(401).json({ message: "Invalid Credentials" })
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid Credentials" })
            return
        }

        const token = generateToken(user._id.toString(), user.role)

        res.cookie("token", token, COOKIE_OPTIONS)
        res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ error, message: "Server error, please try after some time" })
    }
}

export const validateToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select("-password")
        if (!user) {
            res.status(401).json({ message: "User not found" })
            return
        }

        res.status(200).json({
            username: user.username,
            email: user.email,
            role: user.role
        })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}

export const logout = (_req: Request, res: Response): void => {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" })
    res.status(200).json({ message: "Logged out successfully" })
}
