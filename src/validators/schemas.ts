import { z } from "zod"

export const userRegisterSchema = z.object({
    username: z.string().min(3,"Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})

export const userLoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})

export const songUploadSchema = z.object({
    title: z.string().min(1, "Title is required"),
    artist: z.union([
        z.string().min(1, "Artist is required"),
        z.array(z.string().min(1)).min(1, "At least one artist is required"),
    ]),
    genre: z.union([
        z.string().min(1, "Genre is required"),
        z.array(z.string().min(1)).min(1, "At least one genre is required"),
    ]),
    duration: z.coerce.number().positive("Duration must be a positive number"),
})

export const artistCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().min(1, "Bio is required"),
    profileImageURL: z.string("Profile image must be a valid URL"),
})

export const playlistCreateSchema = z.object({
    name: z.string().min(1,"Name is required")
})
