import multer from "multer"

const storage = multer.memoryStorage()

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedAudio = [
        "audio/mpeg",       // .mp3
        "audio/wav",        // .wav
        "audio/ogg",        // .ogg
        "audio/flac",       // .flac
        "audio/aac",        // .aac
        "audio/mp4",        // .m4a
        "audio/x-m4a",      // .m4a (alt)
    ]

    const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    if (file.fieldname === "audio" && allowedAudio.includes(file.mimetype)) {
        cb(null, true)
    } else if (file.fieldname === "coverImage" && allowedImages.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`))
    }
}

export const uploadSongFiles = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter,
}).fields([
    { name: "audio", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
])
