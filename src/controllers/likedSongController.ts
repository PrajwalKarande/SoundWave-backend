import type { AuthRequest } from "../middleware/auth.js"
import type { Response } from "express"
import { LikedSong } from "../Models/LikedSong.js"
import { Types } from "mongoose"

export const likeSong = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const { songId } = req.body

        const existing = await LikedSong.exists({ user: userId, song: songId })
        if (existing) {
            res.status(409).json({ message: "Song already liked" })
            return
        }

        await LikedSong.create({ user: userId, song: songId })
        res.status(201).json({ message: "Song liked" })
    } catch (error) {
        console.error("Error liking song:", error)
        res.status(500).json({ message: "Failed to like song", error })
    }
}

export const unlikeSong = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const songId = req.params.songId as string
        const result = await LikedSong.findOneAndDelete({ user: new Types.ObjectId(userId), song: new Types.ObjectId(songId) })
        if (!result) {
            res.status(404).json({ message: "Liked song not found" })
            return
        }

        res.status(200).json({ message: "Song unliked" })
    } catch (error) {
        console.error("Error unliking song:", error)
        res.status(500).json({ message: "Failed to unlike song", error })
    }
}

export const getLikedSongs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const limit = Math.min(Number(req.query.limit) || 50, 100)
        const cursor = req.query.cursor as string | undefined

        const filter: Record<string, unknown> = { user: userId }
        if (cursor) {
            filter._id = { $lt: cursor }
        }

        const docs = await LikedSong.find(filter)
            .sort({ likedAt: -1 })
            .limit(limit + 1)
            .populate({
                path: "song",
                select: "title url coverImage artist duration",
                populate: { path: "artist", select: "name profileImage" }
            })
            .lean()

        const hasMore = docs.length > limit
        if (hasMore) docs.pop()

        res.status(200).json({
            songs: docs.map(d => d.song),
            nextCursor: hasMore ? String(docs[docs.length - 1]?._id) : null,
            hasMore
        })
    } catch (error) {
        console.error("Error getting liked songs:", error)
        res.status(500).json({ message: "Failed to get liked songs", error })
    }
}

// Returns only song IDs — used by frontend to hydrate like state across the app
export const getLikedSongIds = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const docs = await LikedSong.find({ user: userId }).select("song").lean()
        res.status(200).json({ ids: docs.map(d => d.song) })
    } catch (error) {
        console.error("Error getting liked song IDs:", error)
        res.status(500).json({ message: "Failed to get liked song IDs", error })
    }
}

export const checkLiked = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const songId = req.params.songId as string
        const liked = await LikedSong.exists({ user: new Types.ObjectId(userId), song: new Types.ObjectId(songId) })
        res.status(200).json({ liked: !!liked })
    } catch (error) {   
        console.error("Error checking liked status:", error)
        res.status(500).json({ message: "Failed to check liked status", error })
    }
}
