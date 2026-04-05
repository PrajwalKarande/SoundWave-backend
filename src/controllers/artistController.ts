import { Artist } from "../Models/Artist.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export const createArtist = async (req: AuthRequest, res: Response) => {
    try {
        const { name, bio, profileImageURL } = req.body;

        if (!name || !bio || !profileImageURL) {
            res.status(400).json({ message: "All fields are required: name, bio, profileImageURL" });
            return;
        }

        const existingArtist = await Artist.findOne({ name });
        if (existingArtist) {
            res.status(400).json({ message: "Artist already exists" });
            return;
        }

        const artist = new Artist({ name, bio, profileImageURL });
        await artist.save();
        res.status(201).json(artist);
    } catch (error) {
        console.error("Error creating artist:", error);
        res.status(500).json({ message: "Failed to create artist" });
    }
}

export const getAllArtists = async (req: AuthRequest, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const cursor = req.query.cursor as string | undefined

        const query = cursor ? { _id: { $gt: cursor } } : {}

        const artists = await Artist.find(query)
            .sort({ _id: 1 })
            .limit(limit + 1)
            .select('-__v')

        const hasMore = artists.length > limit
        if (hasMore) artists.pop()

        const nextCursor = hasMore && artists.length > 0 ? artists[artists.length - 1]!._id.toString() : null

        res.status(200).json({ data: artists, nextCursor, hasMore })
    } catch (error) {
        console.error("Error getting artists:", error);
        res.status(500).json({ message: "Failed to get artists", error });
    }
}

export const getArtistById = async (req: AuthRequest, res: Response) => {
    try {
        const artist = await Artist.findById(req.params.id).select('-__v');
        if (!artist) {
            res.status(404).json({ message: "Artist not found" });
            return;
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error("Error getting artist:", error);
        res.status(500).json({ message: "Failed to get artist", error });
    }
}

export const searchArtistsByName = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const searchQuery = req.query.q as string

        if (!searchQuery || searchQuery.trim().length === 0) {
            res.status(400).json({ message: "Search query is required" })
            return
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const cursor = req.query.cursor as string | undefined

        const filter: Record<string, any> = { name: { $regex: searchQuery, $options: "i" } }
        if (cursor) filter._id = { $gt: cursor }

        const artists = await Artist.find(filter)
            .sort({ _id: 1 })
            .limit(limit + 1)
            .select('-__v')

        const hasMore = artists.length > limit
        if (hasMore) artists.pop()

        const nextCursor = hasMore && artists.length > 0 ? artists[artists.length - 1]!._id.toString() : null

        res.status(200).json({ data: artists, nextCursor, hasMore })
    } catch (error) {
        console.error("Search artists error:", error)
        res.status(500).json({ message: "Failed to search artists" })
    }
}


export const updateArtist = async (req: AuthRequest, res: Response) => {
    try {
        const { name, bio, profileImageURL } = req.body;

        const updates: Record<string, any> = {};
        if (name) updates.name = name;
        if (bio) updates.bio = bio;
        if (profileImageURL) updates.profileImageURL = profileImageURL;

        const artist = await Artist.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!artist) {
            res.status(404).json({ message: "Artist not found" });
            return;
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error("Error updating artist:", error);
        res.status(500).json({ message: "Failed to update artist" });
    }
}

export const deleteArtist = async (req: AuthRequest, res: Response) => {
    try {
        const artist = await Artist.findByIdAndDelete(req.params.id);
        if (!artist) {
            res.status(404).json({ message: "Artist not found" });
            return;
        }
        res.status(200).json({ message: "Artist deleted successfully" });
    } catch (error) {
        console.error("Error deleting artist:", error);
        res.status(500).json({ message: "Failed to delete artist", error });
    }
}