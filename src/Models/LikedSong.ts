import { model, Schema, Types } from "mongoose"

export interface ILikedSong {
    user: Types.ObjectId
    song: Types.ObjectId
    likedAt: Date
}

const likedSongSchema = new Schema<ILikedSong>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
    likedAt: { type: Date, default: Date.now }
}, { timestamps: false })

// Unique per (user, song) pair — prevents duplicate likes
likedSongSchema.index({ user: 1, song: 1 }, { unique: true })
// Fast retrieval of a user's liked songs sorted by most recently liked
likedSongSchema.index({ user: 1, likedAt: -1 })

export const LikedSong = model<ILikedSong>("LikedSong", likedSongSchema)
