import mongoose, { Schema, Document, Types } from 'mongoose';

interface IRecentlyPlayedSong {
  songId: Types.ObjectId;
  playedAt: Date;
}

interface IRecentlyPlayed extends Document {
  userId: Types.ObjectId;
  songs: IRecentlyPlayedSong[];
}

const RecentlyPlayedSchema = new Schema<IRecentlyPlayed>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  songs: [
    {
      songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
      playedAt: { type: Date, default: Date.now },
    },
  ],
});

export const RecentlyPlayed = mongoose.model<IRecentlyPlayed>('RecentlyPlayed', RecentlyPlayedSchema);
