import type { NextFunction, Request, Response } from "express"
import { verifyToken } from "../Utils/jwt.js"

export interface AuthRequest extends Request
{
    user?:{
        id:string
        role:string
    }
}

export const authenticate = (req:AuthRequest,res:Response,next:NextFunction):void => {
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({message:"Access denied, No token Provided"})
        return
    }

    const jwtToken = authHeader.split(" ")[1]

    try{
        const decodedToken = verifyToken(jwtToken!)
        req.user = decodedToken
        next()
    }catch(error){
        res.status(401).json({message: "Invalid or expired Token"})
    }
}

export const authorizeAdmin = (req:AuthRequest,res:Response,next:NextFunction)=> {
    if(req.user?.role !== "admin"){
        res.status(403).json({message: "Access denied. Admins only"})
        return
    }
    next()
}