import { model, Schema, Types } from "mongoose"

export interface ISong{
    title:string
    url:string
    r2Key:string
    coverImage:string
    artist:Types.ObjectId[]
    genre:string[]
    duration?:number
    createdAt:Date
}


export const songSchema = new Schema<ISong>({
    title:{type:String,required:true},
    url:{type:String,required:true},
    r2Key:{type:String,required:true},
    coverImage:{type:String,default:""},
    artist:{type:[{type:Types.ObjectId,ref:"Artist"}],required:true},
    genre:{type:[{type:String}],required:true},
    duration:{type:Number},
    createdAt:{type:Date,default:Date.now}
})

export const Song = model<ISong>("Song",songSchema)