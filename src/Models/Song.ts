import { model, Schema, Types } from "mongoose"

export interface ISong{
    title:string
    url:string
    artist:Types.ObjectId[]
    album:Types.ObjectId
    genre:string[]
    duration:number
    createdAt:Date
}


export const songSchema = new Schema<ISong>({
    title:{type:String,required:true},
    url:{type:String,required:true},
    artist:{type:[{type:Types.ObjectId,ref:"Artist"}],required:true},
    album:{type:Types.ObjectId,ref:"Album",required:true},
    genre:{type:[{type:String}],required:true},
    duration:{type:Number,required:true},
    createdAt:{type:Date,default:Date.now}
})

export const Song = model<ISong>("Song",songSchema)