import type { AuthRequest } from "../middleware/auth.js";
import type { Response } from "express";
import { Playlist } from "../Models/Playlist.js";
import { playlistCreateSchema } from "../validators/schemas.js";

export const createPlaylist = async (req:AuthRequest,res:Response):Promise<void> => {

    const validation = playlistCreateSchema.safeParse(req.body)
    if(!validation.success){
        res.status(400).json({ message: "Invalid playlist data", error: validation.error })
        return
    }

    try{
        if(!req.user?.id){
            res.status(401).json({ message: "User not found" })
            return
        }
        const { name } = req.body
        
        const playlist = new Playlist({
            name,
            user:req.user.id
        })
        await playlist.save()
        res.status(201).json(playlist)

    }
    catch(error){
        console.error("Error creating playlist:", error)
        res.status(500).json({ message: "Failed to create playlist", error })
    }
    
}

export const getUserPlaylists = async (req:AuthRequest,res:Response):Promise<void> => {
    const userId = req.user?.id
    if(!userId){
        res.status(401).json({ message: "User not found" })
        return
    }
    try{
        const playlists = await Playlist.find({ user: userId })
        res.status(200).json(playlists)
    }
    catch(error){
        console.error("Error getting user playlists:", error)
        res.status(500).json({ message: "Failed to get user playlists", error })
    }
}

export const updatePlaylist = async (req:AuthRequest,res:Response):Promise<void> => {
    try{
        const { name } = req.body
        
        const playlist = await Playlist.findByIdAndUpdate(req.params.id,{
            name
        })
        if(!playlist){
            res.status(404).json({ message: "Playlist not found" })
            return
        }
        res.status(200).json(playlist)

    }
    catch(error){
        console.error("Error updating playlist:", error)
        res.status(500).json({ message: "Failed to update playlist", error })
    }
}

export const deletePlaylist = async (req:AuthRequest,res:Response):Promise<void> => {
    try{
        const playlist = await Playlist.findByIdAndDelete(req.params.id)
        if(!playlist){
            res.status(404).json({ message: "Playlist not found" })
            return
        }
        res.status(200).json({ message: "Playlist deleted successfully" })

    }
    catch(error){
        console.error("Error deleting playlist:", error)
        res.status(500).json({ message: "Failed to delete playlist", error })
    }
}

export const addSongToPlaylist = async (req:AuthRequest,res:Response):Promise<void> => {
    try{
        const { songId } = req.body
        const playlist = await Playlist.findById(req.params.id)
        if(!playlist){
            res.status(404).json({ message: "Playlist not found" })
            return
        }
        playlist.songs.push(songId)
        await playlist.save()
        res.status(200).json({ message: "Song added to playlist successfully" })

    }
    catch(error){
        console.error("Error adding song to playlist:", error)
        res.status(500).json({ message: "Failed to add song to playlist", error })
    }
} 

export const deleteSongFromPlaylist = async (req:AuthRequest,res:Response):Promise<void> => {
    try{
        const { songId } = req.body
        if(!songId){
            res.status(400).json({ message: "Song ID is required" })
            return
        }
        const playlist = await Playlist.findById(req.params.id)
        if(!playlist){
            res.status(404).json({ message: "Playlist not found" })
            return
        }
        playlist.songs = playlist.songs.filter((song) => song.toString() !== songId)
        await playlist.save()
        res.status(200).json({ message: "Song deleted from playlist successfully" })

    }
    catch(error){
        console.error("Error deleting song from playlist:", error)
        res.status(500).json({ message: "Failed to delete song from playlist", error })
    }
}