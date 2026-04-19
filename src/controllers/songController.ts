import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.js"
import { Song } from "../Models/Song.js"
import { Artist } from "../Models/Artist.js"
import { RecentlyPlayed } from "../Models/RecentlyPlayed.js"
import mongoose from "mongoose"
import { uploadToR2, deleteFromR2 } from "../Utils/r2Upload.js"

export const uploadSong = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, artist, genre, duration } = req.body

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
        const audioFile = files?.audio?.[0]
        const coverFile = files?.coverImage?.[0]

        if (!audioFile) {
            res.status(400).json({ message: "Audio file is required" })
            return
        }

        if (!title || !artist || !genre || !duration) {
            res.status(400).json({ message: "All fields are required: title, artist, genre, duration" })
            return
        }

        // Upload audio to R2
        const { url: audioUrl, key: audioKey } = await uploadToR2(
            audioFile.buffer,
            audioFile.originalname,
            audioFile.mimetype,
            "songs"
        )

        let coverImageUrl = ""
        if (coverFile) {
            const { url } = await uploadToR2(
                coverFile.buffer,
                coverFile.originalname,
                coverFile.mimetype,
                "covers"
            )
            coverImageUrl = url
        }

        const parseArrayData = (data: any): string[] => {
            if (Array.isArray(data)) return data;
            if (typeof data === "string") {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) return parsed.map(String);
                } catch {
                    const cleaned = data.replace(/^\[|\]$/g, '');
                    return cleaned.split(',').map((item: string) => item.replace(/^\s*['"]|['"]\s*$/g, '').trim()).filter(Boolean);
                }
            }
            return [String(data)];
        };

        const artistNames = parseArrayData(artist);
        const genreList = parseArrayData(genre);

        const artistList = await Promise.all(
            artistNames.map(async (name) => {
                if (mongoose.Types.ObjectId.isValid(name)) {
                    return name;
                }
                const artistDoc = await Artist.findOne({ name: new RegExp(`^${name}$`, "i") });
                if (!artistDoc) throw new Error(`Artist '${name}' not found`);
                return artistDoc._id;
            })
        );

        const existingSong = await Song.findOne({title});
        if(existingSong){
            res.status(400).json({message:"Song already exists"});
            return;
        }

        const song = await Song.create({
            title,
            url: audioUrl,
            r2Key: audioKey,
            coverImage: coverImageUrl,
            artist: artistList,
            genre: genreList,
            duration: Number(duration),
        })

        // Push song reference into each artist's songs array
        await Artist.updateMany(
            { _id: { $in: artistList } },
            { $addToSet: { songs: song._id } }
        )

        res.status(201).json({
            message: "Song uploaded successfully",
            song,
        })
    } catch (error: any) {
        console.error("Upload song error:", error)
        res.status(error.message?.includes("not found") ? 404 : 500).json({ message: error.message || "Failed to upload song" })
    }
}

export const getAllSongs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const cursor = req.query.cursor as string | undefined

        const query = cursor ? { _id: { $gt: cursor } } : {}

        const songs = await Song.find(query)
            .sort({ _id: 1 })
            .limit(limit + 1)
            .populate("artist", "name profileImage")
            .select('-__v')

        const hasMore = songs.length > limit
        if (hasMore) songs.pop()

        const nextCursor = hasMore && songs.length > 0 ? songs[songs.length - 1]!._id.toString() : null

        res.status(200).json({ data: songs, nextCursor, hasMore })
    } catch (error) {
        console.error("Get songs error:", error)
        res.status(500).json({ message: "Failed to fetch songs" })
    }
}

export const getSongById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const song = await Song.findById(req.params.id)
            .populate("artist", "name profileImage")

        if (!song) {
            res.status(404).json({ message: "Song not found" })
            return
        }

        res.status(200).json(song)
    } catch (error) {
        console.error("Get song error:", error)
        res.status(500).json({ message: "Failed to fetch song" })
    }
}

export const searchSongsByTitle = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const searchQuery = req.query.q as string

        if (!searchQuery || searchQuery.trim().length === 0) {
            res.status(400).json({ message: "Search query is required" })
            return
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const cursor = req.query.cursor as string | undefined

        const filter: Record<string, any> = { title: { $regex: searchQuery, $options: "i" } }
        if (cursor) filter._id = { $gt: cursor }

        const songs = await Song.find(filter)
            .sort({ _id: 1 })
            .limit(limit + 1)
            .populate("artist", "name profileImage")
            .select('-__v')

        const hasMore = songs.length > limit
        if (hasMore) songs.pop()

        const nextCursor = hasMore && songs.length > 0 ? songs[songs.length - 1]!._id.toString() : null

        res.status(200).json({ data: songs, nextCursor, hasMore })
    } catch (error) {
        console.error("Search songs error:", error)
        res.status(500).json({ message: "Failed to search songs" })
    }
}

export const deleteSong = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const song = await Song.findById(req.params.id)

        if (!song) {
            res.status(404).json({ message: "Song not found" })
            return
        }

        // Delete audio from R2
        await deleteFromR2(song.r2Key)

        // Remove song reference from all artists
        await Artist.updateMany(
            { _id: { $in: song.artist } },
            { $pull: { songs: song._id } }
        )

        // Delete from MongoDB
        await Song.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: "Song deleted successfully" })
    } catch (error) {
        console.error("Delete song error:", error)
        res.status(500).json({ message: "Failed to delete song" })
    }
}

export const updateRecentlyPlayed = async (userId: string, songId: string): Promise<void> => {
    const userOId = new mongoose.Types.ObjectId(userId)
    const songOId = new mongoose.Types.ObjectId(songId)

    // Step 1: Remove the song if it already exists (prevent duplicates).
    // upsert:true creates the document for first-time users.
    await RecentlyPlayed.findOneAndUpdate(
        { userId: userOId },
        { $pull: { songs: { songId: songOId } } },
        { upsert: true }
    )

    // Step 2: Prepend to front with $position:0 and trim to 10 with $slice.
    await RecentlyPlayed.updateOne(
        { userId: userOId },
        {
            $push: {
                songs: {
                    $each: [{ songId: songOId, playedAt: new Date() }],
                    $position: 0,
                    $slice: 10,
                },
            },
        }
    )
}

export const markPlayed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await updateRecentlyPlayed(req.user!.id, req.params.id as string)
        res.json({ success: true })
    } catch (error) {
        console.error("Mark played error:", error)
        res.status(500).json({ message: "Failed to record play" })
    }
}

export const getRecentlyPlayed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const doc = await RecentlyPlayed.findOne({ userId: req.user!.id }).populate({
            path: "songs.songId",
            select: "title artist coverImage duration url",
            populate: { path: "artist", select: "name profileImage" },
        })

        if (!doc) {
            res.json({ songs: [] })
            return
        }

        // Unwrap populated Song documents; filter nulls for deleted songs
        const songs = doc.songs.map((entry) => entry.songId).filter(Boolean)

        res.json({ songs })
    } catch (error) {
        console.error("Get recently played error:", error)
        res.status(500).json({ message: "Failed to fetch recently played" })
    }
}