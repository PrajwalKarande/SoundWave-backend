import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../Models/User.js";


export const getAllUsers = async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const cursor = req.query.cursor as string | undefined

        const query = cursor ? { _id: { $gt: cursor } } : {}

        const users = await User.find(query)
            .sort({ _id: 1 })
            .limit(limit + 1)
            .select('-__v -password')

        const hasMore = users.length > limit
        if (hasMore) users.pop()

        const nextCursor = hasMore && users.length > 0 ? users[users.length - 1]!._id.toString() : null

        res.status(200).json({ data: users, nextCursor, hasMore })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}

export const deleteUser = async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const id = req.params.id as string
        const user = await User.findByIdAndDelete(id)
        if(!user){
            res.status(404).json({ message: "User not found" })
            return
        }
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}

export const changeUserRole = async (req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const id = req.params.id as string
        const role = req.query.role as "user" | "admin"
        const user = await User.findById(id)
        if(!user){
            res.status(404).json({ message: "User not found" })
            return
        }
        user.role = role
        await user.save()
        res.status(200).json({ message: "User role changed successfully" })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}