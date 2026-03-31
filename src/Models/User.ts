import { model, Schema, Types } from "mongoose";

export interface IUser {
    username:string
    email:string
    password:string
    role:"user" | "admin"
    playlists: Types.ObjectId[]
    likedSongs: Types.ObjectId[]
    createdAt:Date
}

export const userSchema = new Schema<IUser>({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,enum:["user","admin"],default:"user"},
    playlists:{type:[{type:Types.ObjectId,ref:"Playlist"}],default:[]},
    likedSongs:{type:[{type:Types.ObjectId,ref:"Song"}],default:[]},
    createdAt:{type:Date,default:Date.now,select:false}
})


export const User = model<IUser>("User",userSchema)

