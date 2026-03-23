import { model, Schema, Types } from "mongoose";

export interface IAlbum{
    name:string
    songs:Types.ObjectId[]
    artist:Types.ObjectId
    releaseDate:Date
    createdAt:Date
}

export const albumSchema = new Schema<IAlbum>({
    name:{type:String,required:true},
    songs:{type:[{type:Types.ObjectId,ref:"Song"}],default:[]},
    artist:{type:Types.ObjectId,ref:"Artist",required:true},
    releaseDate:{type:Date,required:true},
    createdAt:{type:Date,default:Date.now}
})

export const Album = model<IAlbum>("Album",albumSchema)