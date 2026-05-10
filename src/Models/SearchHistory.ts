import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISearchHistoryEntry {
    songId: Types.ObjectId;
    searchedAt: Date;
}

interface ISearchHistory extends Document {
    userId: Types.ObjectId;
    songs: ISearchHistoryEntry[];
}

const SearchHistorySchema = new Schema<ISearchHistory>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    songs: [
        {
            songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
            searchedAt: { type: Date, default: Date.now },
        },
    ],
});

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
