import { model, Schema, Types } from "mongoose";

export interface IPlaylist{
    name:string
    songs:Types.ObjectId[]
    user:Types.ObjectId
    createdAt:Date
}


export const playlistSchema = new Schema<IPlaylist>({
    name:{type:String,required:true},
    songs:{type:[{type:Types.ObjectId,ref:"Song"}],default:[]},
    user:{type:Types.ObjectId,ref:"User",required:true},
    createdAt:{type:Date,default:Date.now,select:false}
})

export const Playlist = model<IPlaylist>("Playlist",playlistSchema)