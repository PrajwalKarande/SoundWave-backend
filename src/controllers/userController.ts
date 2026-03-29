import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../Models/User.js";


export const getAllUsers = async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const users = await User.find()
        res.status(200).json({ users })
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