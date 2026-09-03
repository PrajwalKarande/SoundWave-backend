import { model, Schema, Types } from "mongoose";

export interface IArtist{
    name:string
    bio:string
    profileImageURL:string
    songs:Types.ObjectId[]
    createdAt?:Date
}


export const artistSchema = new Schema<IArtist>({
    name:{type:String,required:true,trim:true,maxlength:100},
    bio:{type:String,required:true,maxlength:2000},
    profileImageURL:{type:String,required:true,maxlength:500},
    songs:{type:[{type:Schema.Types.ObjectId,ref:"Song"}],default:[]},
    createdAt:{type:Date,default:Date.now,select:false}
})

// Indexes for fast read operations
artistSchema.index({ name: "text" })      // text search on name

export const Artist = model<IArtist>("Artist",artistSchema)