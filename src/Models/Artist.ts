import { model, Schema, Types } from "mongoose";

export interface IArtist{
    name:string
    bio:string
    profileImage:string
    songs:Types.ObjectId[]
    albums:Types.ObjectId[]
    createdAt:Date
}


export const artistSchema = new Schema<IArtist>({
    name:{type:String,required:true},
    bio:{type:String,required:true},
    profileImage:{type:String,required:true},
    songs:{type:[{type:Types.ObjectId,ref:"Song"}],default:[]},
    albums:{type:[{type:Types.ObjectId,ref:"Album"}],default:[]},
    createdAt:{type:Date,default:Date.now}
})

export const Artist = model<IArtist>("Artist",artistSchema)