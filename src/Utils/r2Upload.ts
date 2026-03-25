import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { r2Client } from "../config/r2.js"

export const uploadToR2 = async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = "songs"
): Promise<{ url: string; key: string }> => {
    const key = `${folder}/${Date.now()}-${fileName}`
    const client = r2Client()

    await client.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME as string,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
        })
    )

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

    return { url: publicUrl, key }
}

export const deleteFromR2 = async (key: string): Promise<void> => {
    const client = r2Client()

    await client.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME as string,
            Key: key,
        })
    )
}
