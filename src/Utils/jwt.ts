import jwt from "jsonwebtoken"

export const generateToken = (userId:string,role:string) => {
    const secret = process.env.JWT_SECRET as string
    return jwt.sign({id:userId,role},secret,{expiresIn:"7d"})
}

export const verifyToken = (token:string) => {
    const secret = process.env.JWT_SECRET as string
    return jwt.verify(token,secret) as {id:string,role:string}
}

