import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.js"
import { Song } from "../Models/Song.js"
import { RecentlyPlayed } from "../Models/RecentlyPlayed.js"
import mongoose from "mongoose"

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)

        const recentDoc = await RecentlyPlayed.findOne({ userId: req.user!.id }).populate({
            path: "songs.songId",
            select: "artist",
            populate: { path: "artist", select: "_id" },
        })

        // Cold start: no history yet — return newest songs
        if (!recentDoc || recentDoc.songs.length === 0) {
            const songs = await Song.find()
                .sort({ _id: -1 })
                .limit(limit)
                .populate("artist", "name profileImage")
                .select("-__v -r2Key")
            res.json({ songs, source: "new" })
            return
        }

        const playedSongIds = recentDoc.songs
            .map((entry) => (entry.songId as any)?._id)
            .filter(Boolean)

        const artistIds = new Set<string>()
        for (const entry of recentDoc.songs) {
            const song = entry.songId as any
            if (song?.artist) {
                for (const a of song.artist) {
                    artistIds.add(a._id.toString())
                }
            }
        }

        // If no artist info could be extracted, fall back to newest
        if (artistIds.size === 0) {
            const songs = await Song.find({ _id: { $nin: playedSongIds } })
                .sort({ _id: -1 })
                .limit(limit)
                .populate("artist", "name profileImage")
                .select("-__v -r2Key")
            res.json({ songs, source: "new" })
            return
        }

        const songs = await Song.find({
            artist: { $in: Array.from(artistIds).map((id) => new mongoose.Types.ObjectId(id)) },
            _id: { $nin: playedSongIds },
        })
            .sort({ _id: -1 })
            .limit(limit)
            .populate("artist", "name profileImage")
            .select("-__v -r2Key")

        res.json({ songs, source: "artist-based" })
    } catch (error) {
        console.error("Get recommendations error:", error)
        res.status(500).json({ message: "Failed to fetch recommendations" })
    }
}

export const getTrending = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const songs = await Song.find({
            playCount: { $gt: 0 },
            lastPlayedAt: { $gte: sevenDaysAgo },
        })
            .sort({ playCount: -1 })
            .limit(limit)
            .populate("artist", "name profileImage")
            .select("-__v -r2Key")

        res.json({ songs })
    } catch (error) {
        console.error("Get trending error:", error)
        res.status(500).json({ message: "Failed to fetch trending songs" })
    }
}
