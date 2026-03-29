import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Song } from "../Models/Song.js";
import { User } from "../Models/User.js";
import { Artist } from "../Models/Artist.js";

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const songs = await Song.countDocuments()
        const users = await User.countDocuments()
        const artists = await Artist.countDocuments()
        res.status(200).json({ songs, users, artists })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}