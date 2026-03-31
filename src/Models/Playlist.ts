import { model, Schema, Types } from "mongoose";

export interface IPlaylist{
    name:string
    description:string
    songs:Types.ObjectId[]
    user:Types.ObjectId
    isPublic:boolean
    createdAt:Date
}


export const playlistSchema = new Schema<IPlaylist>({
    name:{type:String,required:true},
    description:{type:String,default:""},
    songs:{type:[{type:Types.ObjectId,ref:"Song"}],default:[]},
    user:{type:Types.ObjectId,ref:"User",required:true},
    isPublic:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now,select:false}
})

export const Playlist = model<IPlaylist>("Playlist",playlistSchema)